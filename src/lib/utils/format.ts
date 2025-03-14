import { formatUnits } from "viem";

export const truncateNumber = (balance: string | number): string => {
  const n = Number(
    typeof balance === 'string' ? balance.replace(/,/g, '') : balance,
  )
  if (isNaN(n)) {
    console.error('Invalid number input:', balance)
    return 'Invalid number'
  }
  const format = (num: number, divisor: number, suffix: string) =>
    `${(num / divisor).toFixed(2).replace(/\.?0+$/, '')}${suffix}`

  if (n >= 1000000000) {
    return format(n, 1000000000, 'B')
  }
  if (n >= 1000000) {
    return format(n, 1000000, 'M')
  }
  if (n >= 1000) {
    return format(n, 1000, 'K')
  }
  return n.toFixed(2).replace(/\.?0+$/, '')
}

export function getShareValue(shares: bigint, sharePrice: bigint) {
  return (Number(formatUnits(shares, 18)) * Number(formatUnits(sharePrice, 18)))
}

export function formatEthValue(value: number): string {
  // Format to max 6 decimal places, removing trailing zeros
  return value.toFixed(6).replace(/\.?0+$/, '') + ' ETH';
}

/**
 * Format a date string into a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format a Unix timestamp (seconds since epoch) into a human-readable format
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatUnixTimestamp(timestamp: string | undefined): string {
  if (!timestamp) return "Unknown";

  try {
    // Convert to number and multiply by 1000 to get milliseconds
    const date = new Date(parseInt(timestamp, 10) * 1000);

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return "Invalid date";
  }
}