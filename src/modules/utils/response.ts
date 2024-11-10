import { HTTPException } from "hono/http-exception"
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

export const buildDataResponseSchema = (
  status: number,
  schema: z.ZodTypeAny,
) => ({
  [status]: {
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
  },
})

export const buildMetadataResponseSchema = (
  status: number,
  description?: string,
  success?: boolean,
) => ({
  [status]: {
    content: {
      "application/json": {
        schema: z.object({
          metadata: z.object({
            success: z.boolean().default(success ?? false),
            message: z
              .string()
              .min(1)
              .default(description || "Error"),
          }),
        }),
      },
    },
    description: description || "Error",
  },
})
