import { NotFoundError } from "elysia"
import { getAll, getAllFrom } from "./get-all"

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
  getAllFrom: async (trainId: string, fromStationId?: string) => {
    const routes = await getAllFrom(trainId, fromStationId)

    if (!routes) {
      throw new NotFoundError("Route data is not found")
    }

    return {
      status: 200,
      data: routes,
    }
  },
}
