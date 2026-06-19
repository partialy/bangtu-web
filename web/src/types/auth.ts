export interface WebUser {
  userId?: number;
  mobile: string;
  nickname?: string;
  headPic?: string;
  webLogin?: number;
  webFirstLoginTime?: string;
  webLastLoginTime?: string;
}

export interface SendCodePayload {
  mobile: string;
}

export interface SendCodeResponse {
  sent: boolean;
}

export interface LoginPayload {
  mobile: string;
  code: string;
}

export interface LoginResponse {
  token: string;
  user?: WebUser;
}
