import { OpenAPIHono } from "@hono/zod-openapi"
import stationController from "./station/station.controller"

const v1 = new OpenAPIHono()

v1.route("/station", stationController)

export default v1
