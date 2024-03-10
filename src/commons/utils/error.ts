export function handleError(e: any): string {
  if (e instanceof Error) {
    return e.message
  } else {
    return JSON.stringify(e)
  }
}
