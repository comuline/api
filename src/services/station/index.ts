import { NotFoundError } from "elysia"
import { syncWrapper } from "../utils/sync"
import { getAll } from "./get-all"
import { getItemById } from "./get-by-id"
import { sync as syncStation } from "./sync"

export const station = {
  sync: async () => {
    const data = await syncWrapper(syncStation, {
      item: "station",
      type: "manual",
    })()

    return {
      status: 200,
      data,
    }
  },
  getAll: async () => {
    const stations = await getAll()

    return {
      status: 200,
      data: stations,
    }
  },
  getById: async (id: string) => {
    const station = await getItemById(id)

    if (!station) {
      throw new NotFoundError("Station data is not found")
    }

    return {
      status: 200,
      data: station,
    }
  },
}
