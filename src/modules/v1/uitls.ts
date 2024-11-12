export function getSecsToMidnight(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return Math.floor((tomorrow.getTime() - now.getTime()) / 1000)
}
