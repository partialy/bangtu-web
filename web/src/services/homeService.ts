import { http } from '@/services/http';
import type { HomeData } from '@/types/content';

export async function getHomeData() {
  const result = await http.get<HomeData>('/home');
  return {
    notices: result.data.notices ?? [],
    topInfos: result.data.topInfos ?? [],
    latestInfos: result.data.latestInfos ?? [],
    stores: result.data.stores ?? []
  };
}
