export type SourceType = 'web' | 'miniapp';

export interface WebNotice {
  id: number;
  title: string;
  content: string;
  isTop?: number;
  publishTime?: string;
}

export interface InfoItem {
  sourceType: SourceType;
  sourceId: number;
  title?: string;
  content: string;
  categoryId?: number;
  categoryName?: string;
  images: string[];
  contactName?: string;
  contactMobile?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  isTop?: number;
  auditStatus?: number;
  createdAt?: string;
}

export interface StoreItem {
  storeId: number;
  storeName: string;
  storeLogo?: string;
  storeAvatar?: string;
  contactsName?: string;
  contactsMobile?: string;
  storePhone?: string;
  province?: string;
  city?: string;
  district?: string;
  storeAddress?: string;
  isTop?: number;
  isHot?: number;
  storeRecommend?: number;
  isXinyu?: number;
  serviceCredit?: number;
  content?: string;
  introduction?: string;
  images: string[];
  createdAt?: string;
}

export interface HomeData {
  notices: WebNotice[];
  topInfos: InfoItem[];
  latestInfos: InfoItem[];
  stores: StoreItem[];
}

export interface ListQuery {
  page?: number;
  size?: number;
}

export interface PublishInfoPayload {
  title: string;
  content: string;
  categoryName?: string;
  images?: string[];
  contactName?: string;
  contactMobile?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
}
