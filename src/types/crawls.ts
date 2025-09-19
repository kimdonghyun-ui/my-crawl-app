export interface CrawlResult {
    id?: number;
    title: string;
    price: number;
    url: string;
    code: string;
    date: string;
    site: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  }
  
  export interface StrapiData<T> {
    id: number;
    attributes: T;
  }
  
  export interface StrapiMeta {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  }
  
  export interface CrawlResponse {
    data: StrapiData<CrawlResult>[];
    meta: StrapiMeta;
  }
  