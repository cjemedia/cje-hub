const rateLimit = new Map<string, { count: number; timestamp: number }>()

export function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimit.get(ip)
  
  if (!record || now - record.timestamp > windowMs) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

