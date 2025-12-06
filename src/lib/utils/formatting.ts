// ============================================================================
// Formatting Utilities
// Path: lib/utils/formatting.ts
// ============================================================================

// ============================================================================
// Date Formatting
// ============================================================================

export function formatDate(
    date: string | Date,
    format: 'short' | 'medium' | 'long' | 'full' = 'medium'
  ): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const options: Intl.DateTimeFormatOptions = {
      short: { month: 'short', day: 'numeric', year: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    }[format];
    
    return d.toLocaleDateString('en-US', options);
  }
  
  export function formatDateTime(
    date: string | Date,
    includeSeconds: boolean = false
  ): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      ...(includeSeconds && { second: '2-digit' }),
    };
    
    return d.toLocaleString('en-US', options);
  }
  
  export function formatTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  
  export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  }
  
  export function formatDateRange(
    startDate: string | Date,
    endDate: string | Date | null
  ): string {
    const start = formatDate(startDate, 'short');
    
    if (!endDate) return `${start} - Present`;
    
    const end = formatDate(endDate, 'short');
    return `${start} - ${end}`;
  }
  
  // ============================================================================
  // Currency Formatting
  // ============================================================================
  
  export function formatCurrency(
    amount: number,
    currency: string = 'EUR',
    showDecimals: boolean = true
  ): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
    
    return formatter.format(amount);
  }
  
  export function formatRate(
    rate: number,
    currency: string = 'EUR',
    period: 'hour' | 'day' | 'month' | 'year' = 'day'
  ): string {
    const formatted = formatCurrency(rate, currency, false);
    const periodText = {
      hour: '/hr',
      day: '/day',
      month: '/mo',
      year: '/yr',
    }[period];
    
    return `${formatted}${periodText}`;
  }
  
  export function formatSalaryRange(
    min: number,
    max: number,
    currency: string = 'EUR'
  ): string {
    return `${formatCurrency(min, currency, false)} - ${formatCurrency(max, currency, false)}`;
  }
  
  // ============================================================================
  // Number Formatting
  // ============================================================================
  
  export function formatNumber(num: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }
  
  export function formatPercentage(
    value: number,
    decimals: number = 1
  ): string {
    return `${formatNumber(value, decimals)}%`;
  }
  
  export function formatCompactNumber(num: number): string {
    if (num >= 1000000) {
      return `${formatNumber(num / 1000000, 1)}M`;
    }
    if (num >= 1000) {
      return `${formatNumber(num / 1000, 1)}K`;
    }
    return formatNumber(num);
  }
  
  // ============================================================================
  // Text Formatting
  // ============================================================================
  
  export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  export function titleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => capitalize(word))
      .join(' ');
  }
  
  export function slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  
  export function truncate(
    str: string,
    length: number,
    suffix: string = '...'
  ): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }
  
  export function pluralize(
    count: number,
    singular: string,
    plural?: string
  ): string {
    if (count === 1) return singular;
    return plural || `${singular}s`;
  }
  
  // ============================================================================
  // Status Formatting
  // ============================================================================
  
  export function formatStatus(status: string): string {
    return status
      .split('_')
      .map(word => capitalize(word))
      .join(' ');
  }
  
  export function getStatusColor(
    status: string
  ): 'success' | 'warning' | 'error' | 'info' | 'default' {
    const successStatuses = ['hired', 'offer_accepted', 'completed', 'active', 'open'];
    const warningStatuses = ['interview_scheduled', 'in_progress', 'pending'];
    const errorStatuses = ['rejected', 'cancelled', 'failed', 'closed'];
    const infoStatuses = ['submitted_to_client', 'scheduled', 'draft'];
    
    const lower = status.toLowerCase();
    
    if (successStatuses.includes(lower)) return 'success';
    if (warningStatuses.includes(lower)) return 'warning';
    if (errorStatuses.includes(lower)) return 'error';
    if (infoStatuses.includes(lower)) return 'info';
    return 'default';
  }
  
  // ============================================================================
  // File Size Formatting
  // ============================================================================
  
  export function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${formatNumber(size, unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
  }
  
  // ============================================================================
  // Phone Number Formatting
  // ============================================================================
  
  export function formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      // US format: (555) 123-4567
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US with country code: +1 (555) 123-4567
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    // International or unknown format
    return phone;
  }
  
  // ============================================================================
  // Duration Formatting
  // ============================================================================
  
  export function formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${mins}m`;
  }
  
  export function formatContractDuration(months: number): string {
    if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    }
    
    return `${years}y ${remainingMonths}m`;
  }
  
  // ============================================================================
  // List Formatting
  // ============================================================================
  
  export function formatList(
    items: string[],
    conjunction: 'and' | 'or' = 'and'
  ): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(` ${conjunction} `);
    
    const last = items[items.length - 1];
    const rest = items.slice(0, -1);
    return `${rest.join(', ')}, ${conjunction} ${last}`;
  }
  
  // ============================================================================
  // Initials
  // ============================================================================
  
  export function getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }