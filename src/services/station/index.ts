import { sql } from "drizzle-orm"
import { db } from "../../db"
import { syncWrapper } from "../utils/sync"
import { sync as syncStation } from "./sync"
import { getAll } from "./get-all"
import { getItemById } from "./get-by-id"

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

    return {
      status: 200,
      data: station,
    }
  },
}
