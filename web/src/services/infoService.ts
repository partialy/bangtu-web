import { http } from '@/services/http';
import type { InfoItem, ListQuery, PublishInfoPayload } from '@/types/content';

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

export async function listInfo(query: ListQuery = {}) {
  const result = await http.get<InfoItem[]>(`/info/list${toQueryString(query)}`);
  return result.data ?? [];
}

export async function publishInfo(payload: PublishInfoPayload) {
  const result = await http.post<InfoItem>('/info', payload);
  return result.data;
}
