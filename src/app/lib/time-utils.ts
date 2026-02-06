/**
 * Formats a timestamp as relative time (e.g., "2 hours ago")
 * Returns a tuple of [relative time, absolute time for hover]
 */
export function formatRelativeTime(timestamp: string): { relative: string; absolute: string } {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  let relative: string;

  if (diffSeconds < 60) {
    relative = 'just now';
  } else if (diffMinutes < 60) {
    relative = `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    relative = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    relative = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffWeeks < 4) {
    relative = `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffMonths < 12) {
    relative = `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    relative = `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  }

  // Absolute time for hover
  const absolute = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return { relative, absolute };
}
