export function getSecsToMidnight(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return Math.floor((tomorrow.getTime() - now.getTime()) / 1000)
}

export function parseTime(timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(":").map(Number)

  // Create date object
  const date = new Date()

  // Get the timezone offset in minutes (GMT+7 = -420 minutes)
  const targetOffset = -420 // GMT+7 in minutes
  const currentOffset = date.getTimezoneOffset()

  // Calculate the difference in offset
  const offsetDiff = targetOffset - currentOffset

  // Set time components and adjust for timezone
  date.setHours(
    hours ?? date.getHours(),
    (minutes ?? date.getMinutes()) + offsetDiff,
    seconds ?? date.getSeconds(),
  )

  return date
}
