import { swagger as primitiveSwagger } from "@elysiajs/swagger"

const swagger = () =>
  primitiveSwagger({
    path: "/docs",
    exclude: ["/docs", "/docs/json", "/", "/health"],
    documentation: {
      info: {
        title: "Comuline API",
        description: "API documentation for Comuline API",
        version: "1.0.0",
      },
      tags: [
        {
          name: "Station",
          description: "Station related endpoints",
        },
        {
          name: "Schedule",
          description: "Schedule related endpoints",
        },
        {
          name: "Route",
          description: "Route related endpoints",
        },
        {
          name: "Utility",
          description: "Utility related endpoints",
        },
      ],
    },
  })

export default swagger
