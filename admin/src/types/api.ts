/** 后端统一返回结构。 */
export interface Result<T> {
  /** 业务状态码。 */
  code?: number;
  /** 请求是否成功。 */
  success?: boolean;
  /** 兼容前端通用提示字段。 */
  message?: string;
  /** Java Result 提示字段。 */
  msg?: string;
  /** Java Result 错误详情。 */
  errorMsg?: string;
  /** 业务数据。 */
  data: T;
}

/** 请求错误。 */
export class HttpError extends Error {
  /** HTTP 状态码。 */
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
