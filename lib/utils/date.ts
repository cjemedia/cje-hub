export function formatDate(date: string | null | undefined) {
  if (!date) return 'N/A'
  // Treat as date-only in UTC to avoid timezone shifts
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    timeZone: 'UTC',
  })
}


