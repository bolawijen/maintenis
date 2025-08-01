import type { Writable } from '@macfja/svelte-persistent-store';

// Function to get log level styles
export function getLogLevelStyles(level: string): string {
  switch (level) {
    case 'error':
      return 'background-color: transparent; color: #dc3545;'; // Red
    case 'warning':
      return 'background-color: transparent; color: #ffc107;'; // Yellow
    case 'info':
    case 'notice': // Added notice as info
      return 'background-color: transparent; color: #17a2b8;'; // Blue
    case 'debug':
      return 'background-color: transparent; color: #6c757d;'; // Gray
    default:
      return 'background-color: transparent; color: #212529;'; // Default dark
  }
}

// fetchLogDetails function
export async function fetchLogDetails(
  currentCollector: string,
  currentId: string,
  page: number,
  limit: number,
  setErrorMessage: (msg: string) => void,
  setLogEntry: (entry: any) => void,
  setLogs: (logs: any[]) => void,
  setTotalLogs: (total: number) => void,
  setNewLogsCount: (count: number) => void
) {
  setErrorMessage('');
  setLogEntry(null);
  setLogs([]); // Clear both
  setNewLogsCount(0); // Reset new logs count on fetch

  try {
    let response;
    let requestUrl;
    if (currentCollector === 'log' && currentId === 'bun-logs-debug-entry') {
      const offset = (page - 1) * limit;
      requestUrl = `${process.env.PUB_TAPAK_BASE_URL}/http-traffic/log/bun-logs-debug-entry?limit=${limit}&offset=${offset}`;
      response = await fetch(requestUrl);
    } else {
      requestUrl = `${process.env.PUB_TAPAK_BASE_URL}/view/${currentId}`;
      response = await fetch(requestUrl);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read X-Total-Count header for pagination
    if (currentCollector === 'log' && currentId === 'bun-logs-debug-entry') {
      const totalCountHeader = response.headers.get('X-Total-Count');
      setTotalLogs(totalCountHeader ? parseInt(totalCountHeader, 10) : 0);
    }

    const data = await response.json();

    if (currentCollector === 'log' && currentId === 'bun-logs-debug-entry') {
      if (Array.isArray(data)) {
        setLogs(data); 
      } else {
        setErrorMessage('Invalid data format received for log list.');
      }
    }
  } catch (error: any) {
    setErrorMessage(`Failed to load log details: ${error.message}`);
  }
}

// Pagination functions
export function goToPage(
  page: number,
  currentPageStore: Writable<number>,
  setNewLogsCount: (count: number) => void,
  totalLogs: number,
  perPageValue: number
) {
  if (page > 0 && page <= Math.ceil(totalLogs / perPageValue)) {
    currentPageStore.set(page);
    setNewLogsCount(0); // Reset new logs count when navigating pages
  }
}

export function nextPage(
  currentValue: number,
  currentPageStore: Writable<number>,
  setNewLogsCount: (count: number) => void,
  totalLogs: number,
  perPageValue: number
) {
  goToPage(currentValue + 1, currentPageStore, setNewLogsCount, totalLogs, perPageValue);
}

export function prevPage(
  currentValue: number,
  currentPageStore: Writable<number>,
  setNewLogsCount: (count: number) => void,
  totalLogs: number,
  perPageValue: number
) {
  goToPage(currentValue - 1, currentPageStore, setNewLogsCount, totalLogs, perPageValue);
}
