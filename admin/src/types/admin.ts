/** 管理员用户信息 */
export interface AdminUser {
  /** 管理员 ID */
  id: number | string;
  /** 登录账号 */
  username: string;
  /** 显示名称 */
  nickname?: string;
  /** 角色名称 */
  roleName?: string;
}

/** 管理员登录参数 */
export interface AdminLoginRequest {
  /** 管理员账号 */
  username: string;
  /** 管理员密码 */
  password: string;
}

/** 管理员登录返回 */
export interface AdminLoginResponse {
  /** 访问令牌 */
  token: string;
  /** 管理员信息 */
  user?: AdminUser;
}

/** 后台菜单标识 */
export type AdminMenuKey =
  | 'dashboard'
  | 'announcements'
  | 'reviews'
  | 'orders'
  | 'settings';
