import { swagger as primitiveSwagger } from "@elysiajs/swagger"

const swagger = () =>
  primitiveSwagger({
    path: "/docs",
    exclude: ["/docs", "/docs/json", "/"],
    documentation: {
      info: {
        title: "Jadwal KRL API",
        version: "1.0.0",
      },
    },
  })

export default swagger
