import pino from "pino"

const transport = pino.transport({
  targets: [
    // Use better stack https://betterstack.com/docs/logs/javascript/pino/
    /*     {
      level: "trace",
      target: "pino/file",
      options: {
        destination: "./logs/file.log",
      },
    }, */
    {
      level: "trace",
      target: "pino-pretty",
      options: {},
    },
  ],
})

export const logger = pino({}, transport)
