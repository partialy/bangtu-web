import { http } from '@/services/http';
import type { HomeData } from '@/types/content';

export async function getHomeData() {
  const result = await http.get<HomeData>('/home');
  return {
    banners: result.data.banners ?? [],
    notices: result.data.notices ?? [],
    popupNotice: result.data.popupNotice ?? null,
    topInfos: result.data.topInfos ?? [],
    latestInfos: result.data.latestInfos ?? [],
    stores: result.data.stores ?? []
  };
}
