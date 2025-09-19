import { fetchApi } from "@/lib/fetchApi";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CrawlResult, CrawlResponse } from "@/types/crawls";
import { format } from "date-fns";

interface CrawlState {
    toTalList:CrawlResult[];
    results: CrawlResult[];
    loading: boolean;
    error: string | null;

    runCrawl: (params: {
        site: string;
        keyword: string;
        include: string[];
        exclude: string[];
        minPrice: number;
        maxPrice: number;
    }) => Promise<void>;

    saveToStrapi: (results: CrawlResult[]) => Promise<void>;
    getCrawl: (site: string) => Promise<void>;
    // 스토어 초기화
    reset: () => void;
}

export const useCrawlStore = create<CrawlState>()(
    persist(
        (set, get) => ({
            toTalList: [],
            results: [],
            loading: false,
            error: null,

            
            // ✅ 크롤링 실행 (Python 서버 호출)
            runCrawl: async ({ site, keyword, include, exclude, minPrice, maxPrice }) => {
                set({ loading: true, error: null });
                try {
                const res = await fetch("api/crawl", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                    site,
                    keyword,
                    include,
                    exclude,
                    min_price: minPrice,
                    max_price: maxPrice,
                    }),
                });

                const data = await res.json();

                if (!data.success) {
                    set({ error: data.error || "조건에 맞는 상품이 없습니다.", loading: false });
                    return;
                }

                // ✅ 결과 저장
                set({ results: data.result, loading: false });

                // ✅ Strapi에도 자동 저장
                    if (data.result && data.result.length > 0) {
                        await get().saveToStrapi(data.result); // 동률 데이터 배열 통째로 전달
                    }
                } catch {
                    set({ error: null, loading: false });
                }
            },

            // ✅ Strapi에 저장 (동률 데이터까지 처리)
            saveToStrapi: async (results: CrawlResult[]) => {
                try {
                    if (!results || results.length === 0) return;
            
                    // const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

                    const today = format(new Date(), "yyyy-MM-dd");

                    const site = results[0].site;
            
                    // 1. 오늘 날짜 + 사이트 기준으로 데이터 조회
                    const query = new URLSearchParams({
                        "filters[date][$eq]": today,
                        "filters[site][$eq]": site,
                    });
            
                    // 2. 위에 오늘 날짜 쿼리로 데이터 조회(오늘 날짜 데이터를 호출함)
                    const checkRes = await fetchApi<CrawlResponse>(`/crawls?${query}`, {
                        method: "GET",
                        credentials: "include", //httpOnly 쿠키 를 제어하려면 필요
                    }, true);

                    const checkData = await checkRes.data;

                
                    // 3. 기존 데이터 있으면 전부 삭제
                    if (checkData && checkData.length > 0) {
                        console.log("오늘 기존 데이터 삭제");
                        for (const item of checkData) {
                            await fetchApi<CrawlResponse>(`/crawls/${item.id}`, {
                                method: "DELETE",
                                credentials: "include", //httpOnly 쿠키 를 제어하려면 필요
                            }, true);
                        }
                    }
                
                    // 4. 새 데이터 전부 저장 (POST 여러 번)
                    for (const result of results) {
                        await fetchApi<CrawlResponse>(`/crawls`, {
                            method: "POST",
                            credentials: "include", //httpOnly 쿠키 를 제어하려면 필요
                            body: JSON.stringify({ data: result }),
                        }, true);
                    }
            
                    console.log("✅ Strapi 저장 완료:", results.length, "개");
                } catch (err) {
                    console.error("❌ Strapi 저장 오류:", err);
                } finally {
                    const site = results[0].site;
                    await get().getCrawl(site);
                }
            },

            // ✅ Strapi에서 불러오기
            getCrawl: async (site: string) => {
                set({ loading: true, error: null });
                try {


                    // 1. 오늘 날짜 + 사이트 기준으로 데이터 조회
                    const query = new URLSearchParams({
                        "filters[site][$eq]": site,
                    });


                  const res = await fetchApi<CrawlResponse>(
                    `/crawls?${query}`,
                    {
                      method: "GET",
                      credentials: "include", // httpOnly 쿠키 제어용
                    },
                    true
                  );
              
                  // ✅ 평탄화 (attributes를 꺼내 단순 구조로 변환)
                  const normalized = res.data.map((item) => ({
                    id: item.id,
                    title: item.attributes.title,
                    price: item.attributes.price,
                    url: item.attributes.url,
                    code: item.attributes.code,
                    date: item.attributes.date,
                    site: item.attributes.site,
                    createdAt: item.attributes.createdAt,
                    updatedAt: item.attributes.updatedAt,
                    publishedAt: item.attributes.publishedAt,
                  }));
              
                  set({ toTalList: normalized });
                } catch {
                  set({ error: null, loading: false });
                } finally {
                  set({ loading: false });
                }
              },



            // reset = 스토어 초기화
            reset: () => {
                set({
                    results: [],
                    loading: false,
                    error: null,
                });
                useCrawlStore.persist.clearStorage();
            },

        }),
        { 
            name: "crawl-storage" 
        }
    )
);
