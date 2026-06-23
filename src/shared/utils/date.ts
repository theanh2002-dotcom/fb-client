export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return '--';
  }
  // Convert "2024-06-23 10:15:30" to "2024-06-23T10:15:30" for cross-browser parsing
  const safeValue = value.includes('T') ? value : value.replace(' ', 'T');
  const dateObj = new Date(safeValue);
  
  if (isNaN(dateObj.getTime())) {
    return '--';
  }
  
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(dateObj);
}

export function formatTime(value: string | null | undefined) {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
