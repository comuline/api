import { OpenAPIHono } from "@hono/zod-openapi"
import * as route from "./station.route"

const controller = new OpenAPIHono()

controller.openapi(route.getAll, (c) => {
  return c.json({
    status: 200,
    data: [
      {
        id: "AC",
        name: "ANCOL",
        daop: 1,
        fgEnable: 1,
        haveSchedule: true,
        updatedAt: "2024-03-10T09:55:07.213Z",
      },
      {
        id: "AK",
        name: "ANGKE",
        daop: 1,
        fgEnable: 1,
        haveSchedule: true,
        updatedAt: "2024-03-10T09:55:07.213Z",
      },
    ],
  })
})

controller.openapi(route.getById, (c) => {
  const { id } = c.req.valid("param")
  return c.json({
    status: 200,
    data: {
      id,
      name: "ANCOL",
      daop: 1,
      fgEnable: 1,
      haveSchedule: true,
      updatedAt: "2024-03-10T09:55:07.213Z",
    },
  })
})

export default controller
