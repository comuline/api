export function handleError(e: any): string {
  if (e instanceof Error) {
    return e.message
  }
  return JSON.stringify(e)
}
