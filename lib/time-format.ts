/**
 * Converts 24-hour time format (HH:MM:SS or HH:MM) to 12-hour format (h:mm AM/PM)
 * @param time24 - Time string in 24-hour format (e.g., "20:00:00" or "20:00")
 * @returns Time string in 12-hour format (e.g., "8:00 PM")
 */
export function formatTime12Hour(time24: string | null | undefined): string {
  if (!time24) return ''
  
  // Handle both "HH:MM:SS" and "HH:MM" formats
  const [hours, minutes] = time24.split(':').map(Number)
  
  if (isNaN(hours) || isNaN(minutes)) return time24
  
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

