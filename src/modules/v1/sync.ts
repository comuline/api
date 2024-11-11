import { z } from "zod"

export class Sync {
  constructor(
    protected url: string | URL | Request,
    protected init?: FetchRequestInit,
  ) {
    this.url = url
    this.init = init
  }

  async request<T extends z.ZodTypeAny>(
    expectedSchema: T,
  ): Promise<z.infer<T> | Response> {
    const req = await fetch(this.url, this.init)

    if (!req.ok) return req

    const data = await req.json()

    const parsedData = expectedSchema.safeParse(data)

    if (!parsedData.success) {
      throw new Error(parsedData.error.message, {
        cause: parsedData.error.cause,
      })
    }

    return parsedData.data
  }
}
