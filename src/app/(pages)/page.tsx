'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { useCrawlStore } from '@/store/crawlStore'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Scatter,
  TooltipProps,
} from 'recharts'
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { CrawlResult } from '@/types/crawls'

export default function Home() {
  const [site, setSite] = useState('gmarket')
  const [keyword, setKeyword] = useState('')
  const [include, setInclude] = useState('')
  const [exclude, setExclude] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000000)

  const { runCrawl, results, reset, loading, getCrawl, toTalList } =
    useCrawlStore()

  // 검색 실행
  const handleSearch = async () => {
    if (!keyword) {
      alert('검색어를 입력해주세요.')
      return
    }
    if (maxPrice === 0) {
      alert('가격 범위를 입력해주세요.')
      return
    }

    await runCrawl({
      site,
      keyword,
      include: include.split(',').map((s) => s.trim()).filter(Boolean),
      exclude: exclude.split(',').map((s) => s.trim()).filter(Boolean),
      minPrice,
      maxPrice,
    })
  }

  // 사이트 바꿀 때마다 초기화
  useEffect(() => {
    reset()
  }, [site, reset])

  // 전체 데이터 불러오기
  useEffect(() => {
    getCrawl(site)
  }, [getCrawl, site])

  // ✅ 타입 안전한 Tooltip 컴포넌트
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload as CrawlResult
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow p-2 text-sm">
          <p className="font-bold text-gray-900">{data.title}</p>
          <p className="text-blue-600">
            {Number(data.price).toLocaleString()}원
          </p>
          <p className="text-gray-500 text-xs">{label}</p>
        </div>
      )
    }
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <hr />

      {/* 🔹 입력 영역 */}
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🛒 최저가 크롤러 실행
        </h1>

        <div className="space-y-4">
          {/* 사이트 선택 */}
          <label className="block">
            <span className="font-semibold text-gray-700">사이트</span>
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="ml-2 border rounded px-3 py-2 w-40"
            >
              <option value="gmarket">G마켓</option>
              <option value="11st">11번가</option>
            </select>
          </label>

          {/* 검색어 */}
          <label className="block">
            <span className="font-semibold text-gray-700">검색어</span>
            <input
              type="text"
              placeholder="예: 닌텐도 스위치2 본체"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="ml-2 border rounded px-3 py-2 w-full"
            />
          </label>

          {/* 포함 키워드 */}
          <label className="block">
            <span className="font-semibold text-gray-700">포함 키워드</span>
            <input
              type="text"
              placeholder="예: 닌텐도,스위치"
              value={include}
              onChange={(e) => setInclude(e.target.value)}
              className="ml-2 border rounded px-3 py-2 w-full"
            />
          </label>

          {/* 제외 키워드 */}
          <label className="block">
            <span className="font-semibold text-gray-700">제외 키워드</span>
            <input
              type="text"
              placeholder="예: 케이스,케이블"
              value={exclude}
              onChange={(e) => setExclude(e.target.value)}
              className="ml-2 border rounded px-3 py-2 w-full"
            />
          </label>

          {/* 가격 범위 */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">가격 범위</span>
            <input
              type="text"
              value={minPrice.toLocaleString()}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '')
                setMinPrice(Number(raw) || 0)
              }}
              className="border rounded px-3 py-2 w-32 text-right"
            />
            <span>~</span>
            <input
              type="text"
              value={maxPrice.toLocaleString()}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '')
                setMaxPrice(Number(raw) || 0)
              }}
              className="border rounded px-3 py-2 w-32 text-right"
            />
          </div>

          {/* 실행 버튼 */}
          <button
            onClick={handleSearch}
            className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
          >
            🚀 실행하기
          </button>
        </div>
      </div>

      {/* 🔹 오늘 검색 결과 */}
      {results && results.length > 0 && (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-green-50 border border-green-200 rounded-xl shadow">
          <h2 className="text-lg font-bold text-green-700">
            ✅ 오늘 검색된 최저가 상품
          </h2>
          <p className="mt-2 text-gray-800">
            아래는 오늘 검색된 최저가 상품 정보입니다.
          </p>
          <pre className="mt-4 p-3 bg-white rounded border text-sm overflow-x-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <hr className="mt-10" />

      {/* 🔹 전체 데이터 & 그래프 */}
      {toTalList && toTalList.length > 0 && (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white border rounded-xl shadow space-y-6">
          <h2 className="text-xl font-bold text-gray-800">
            📈 날짜별 최저가 추세
          </h2>

          {/* JSON raw 보기 */}
          <details className="bg-gray-50 border rounded p-3 text-sm">
            <summary className="cursor-pointer font-semibold text-gray-700">
              데이터 보기 (JSON)
            </summary>
            <pre className="mt-2 p-3 bg-white rounded border text-sm overflow-x-auto">
              {JSON.stringify(toTalList, null, 2)}
            </pre>
          </details>

          {/* 그래프 */}
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={toTalList}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#374151' }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis
                tickFormatter={(value) => value.toLocaleString()}
                tick={{ fontSize: 12, fill: '#374151' }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: '#2563EB',
                  strokeWidth: 2,
                  stroke: '#fff',
                }}
                activeDot={{
                  r: 6,
                  fill: '#1E40AF',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
                name="최저가"
              />
              <Scatter dataKey="price" fill="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <hr className="mt-10" />

      {/* 🔹 로딩 오버레이 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}
    </main>
  )
}
