export type APIResponse<T = unknown> = {
  code: number
  data: T
  status: boolean
  message: "OK" | "ERROR" | "NOT_FOUND" | string
}
