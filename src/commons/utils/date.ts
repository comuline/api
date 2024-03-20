export function parseTime(timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(":").map(Number)
  const date = new Date()
  date.setHours(hours ?? date.getHours())
  date.setMinutes(minutes ?? date.getMinutes())
  date.setSeconds(seconds ?? date.getSeconds())

  return date
}

export function getSecondsRemainingFromNow(): number {
  return (
    60 * new Date(Date.now()).getMinutes() * new Date(Date.now()).getHours()
  )
}
