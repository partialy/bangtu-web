import { http } from '@/services/http';
import type { ListQuery, StoreItem } from '@/types/content';

function toQueryString(query: ListQuery) {
  const params = new URLSearchParams();
  if (query.page) {
    params.set('page', String(query.page));
  }
  if (query.size) {
    params.set('size', String(query.size));
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}

export async function listStores(query: ListQuery = {}) {
  const result = await http.get<StoreItem[]>(`/store/list${toQueryString(query)}`);
  return result.data ?? [];
}
