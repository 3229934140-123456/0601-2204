import { ApiResponse } from '../types/common';

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function successResponse<T>(data: T, message: string = 'success'): ApiResponse<T> {
  return {
    code: 0,
    message,
    data,
    timestamp: Date.now(),
    requestId: generateRequestId(),
  };
}

export function errorResponse(
  code: number,
  message: string,
  data: any = null
): ApiResponse<any> {
  return {
    code,
    message,
    data,
    timestamp: Date.now(),
    requestId: generateRequestId(),
  };
}

export enum ErrorCode {
  SUCCESS = 0,
  PARAM_ERROR = 40000,
  UNAUTHORIZED = 40100,
  FORBIDDEN = 40300,
  NOT_FOUND = 40400,
  ACCOUNT_NOT_BOUND = 40401,
  WORK_NOT_FOUND = 40402,
  INTERNAL_ERROR = 50000,
  SERVICE_UNAVAILABLE = 50300,
  RATE_LIMIT_EXCEEDED = 42900,
}
