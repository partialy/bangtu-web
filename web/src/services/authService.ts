import { http } from '@/services/http';
import type {
  LoginPayload,
  LoginResponse,
  SendCodePayload,
  SendCodeResponse,
  WebUser
} from '@/types/auth';

export async function sendCode(payload: SendCodePayload) {
  const result = await http.post<SendCodeResponse>('/auth/send-code', payload);
  return result.data;
}

export async function login(payload: LoginPayload) {
  const result = await http.post<LoginResponse>('/auth/login', payload);
  return {
    token: result.data.token,
    user: result.data.user ?? { mobile: payload.mobile }
  };
}

export async function getMe() {
  const result = await http.get<WebUser>('/auth/me');
  return result.data;
}
