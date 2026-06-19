import { http } from '@/services/http';
import type { WebNotice } from '@/types/content';

export async function listNotices() {
  const result = await http.get<WebNotice[]>('/notice/list');
  return result.data ?? [];
}

export async function getNoticeDetail(id: number) {
  const result = await http.get<WebNotice>(`/notice/${id}`);
  return result.data;
}
