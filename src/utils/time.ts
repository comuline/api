export function getSecsToMidnight(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return Math.floor((tomorrow.getTime() - now.getTime()) / 1000)
}

export function parseTime(timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(":").map(Number)
  const date = new Date()
  date.setHours(hours ?? date.getHours())
  date.setMinutes(minutes ?? date.getMinutes())
  date.setSeconds(seconds ?? date.getSeconds())

  return date
}
