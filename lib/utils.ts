/**
 * 将数据导出为CSV文件
 * @param data 二维数组，包含要导出的数据
 * @param filename 导出的文件名（不带扩展名）
 */
export function exportToCSV(data: string[][], filename: string) {
  // 处理每个单元格的数据，确保特殊字符正确编码
  const processCell = (cell: string) => {
    // 如果单元格包含逗号、双引号或换行符，则用双引号包裹
    if (/[",\n\r]/.test(cell)) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  // 将每行数据转换为CSV格式
  const csvContent = data
    .map(row => row.map(processCell).join(','))
    .join('\n');

  // 创建Blob对象
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 创建下载链接
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 格式化日期时间
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的日期时间字符串
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化金额
 * @param amount 金额（元）
 * @returns 格式化后的金额字符串
 */
export function formatMoney(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  
  // 四舍五入到2位小数
  const roundedAmount = Math.round(amount * 100) / 100;
  
  // 使用toLocaleString格式化数字，添加千位分隔符
  return roundedAmount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * 类型安全的事件处理器
 */
export function createTypedEventHandler<T extends HTMLElement>() {
  return <E extends Event>(handler: (event: E & { currentTarget: T }) => void) => {
    return (event: E) => handler(event as E & { currentTarget: T });
  };
}

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 等待时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param func 要执行的函数
 * @param limit 时间限制（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 获取查询参数对象
 * @param query 查询字符串
 */
export function getQueryParams(query: string): Record<string, string> {
  return Object.fromEntries(
    new URLSearchParams(query.startsWith('?') ? query.substring(1) : query)
  );
}

/**
 * 将查询参数对象转换为查询字符串
 * @param params 查询参数对象
 */
export function buildQueryString(params: Record<string, string | number | boolean | null | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
} 