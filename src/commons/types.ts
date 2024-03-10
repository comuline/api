export type APIResponse<T = unknown> = {
  data: T
  status: number
  message: "OK" | "ERROR" | "NOT_FOUND" | string
}
