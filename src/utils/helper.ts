import { PaginationParams, PaginationResult } from '../types/common';

export function formatDate(date: Date | number | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

export function getWeekRange(offset: number = 0): { startDate: string; endDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1 - offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    startDate: formatDate(monday),
    endDate: formatDate(sunday),
  };
}

export function paginate<T>(
  list: T[],
  params: PaginationParams
): PaginationResult<T> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const total = list.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    list: list.slice(start, end),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

export function formatPercent(value: number, decimals: number = 2): string {
  return (value * 100).toFixed(decimals) + '%';
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
}
