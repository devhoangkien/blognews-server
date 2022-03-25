/**
 * @file Error transform
 * @description Convert error data in various specific formats - Chuyển đổi dữ liệu lỗi ở nhiều định dạng cụ thể khác nhau
 * @module transformer/error
 */

export function getMessageFromNormalError(error: any): any {
  return error?.message || error
}

export function getMessageFromAxiosError(error: any): any {
  return error?.response?.data || getMessageFromNormalError(error)
}