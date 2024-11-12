import { HTTPException } from "hono/http-exception"
import { StatusCode } from "hono/utils/http-status"
import { z } from "zod"

export const constructResponse = <T extends z.ZodType>(
  schema: T,
  data: z.infer<T>,
): z.infer<T> => {
  const result = schema.safeParse(data)

  if (!result.success) {
    console.log(result.error.issues)
    throw new HTTPException(417, {
      message: "Failed to construct a response",
      cause: result.error.issues,
    })
  }

  return result.data
}

interface BaseResponseSchema {
  status: number
}

interface DataResponseSchema extends BaseResponseSchema {
  type: "data"
  schema: z.ZodTypeAny
}

interface MetadataResponseSchema extends BaseResponseSchema {
  type: "metadata"
  description?: string
}

export const buildResponseSchemas = (
  responses: Array<DataResponseSchema | MetadataResponseSchema>,
) => {
  const result: Record<number, any> = {}

  for (const { status, ...rest } of responses) {
    if (rest.type === "data") {
      const { schema } = rest
      result[status] = {
        content: {
          "application/json": {
            schema: z.object({
              metadata: z.object({
                success: z.boolean().default(true),
              }),
              data: schema,
            }),
          },
        },
        description: "Success",
      }
    } else {
      const { description } = rest

      const defaultDescription = getDefaultDescription(status as StatusCode)

      result[status] = {
        content: {
          "application/json": {
            schema: z.object({
              metadata: z.object({
                success: z.boolean().default(false),
                message: z.string().min(1).default(defaultDescription),
              }),
            }),
          },
        },
        description: defaultDescription,
      }
    }
  }

  return result
}

const getDefaultDescription = (status: StatusCode) => {
  switch (status) {
    case 404:
      return "Not found"
    default:
      return "Internal server error"
  }
}
