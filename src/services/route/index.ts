import { NotFoundError } from "elysia"
import { getAll } from "./get-all"

export const route = {
  getAll: async (trainId: string) => {
    const routes = await getAll(trainId)

    if (!routes) {
      throw new NotFoundError("Route data is not found")
    }

    return {
      status: 200,
      data: routes,
    }
  },
}
