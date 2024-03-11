export function parseTime(timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(":").map(Number)
  const date = new Date()
  date.setHours(hours ?? date.getHours())
  date.setMinutes(minutes ?? date.getMinutes())
  date.setSeconds(seconds ?? date.getSeconds())

  date.setUTCHours(date.getUTCHours() + 7)

  return date
}
