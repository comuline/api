import pino from "pino"

const transport = pino.transport({
  targets: [
    // Uncomment the following lines to log to a file in your local machine
    /*     {
      level: "trace",
      target: "pino/file",
      options: {
        destination: "./logs/file.log",
      },
    }, */
    // Uncomment the following lines if you don't want to use Better Stack's Logtail logging platform
    // https://betterstack.com/docs/logs/javascript/pino/
    {
      target: "@logtail/pino",
      options: { sourceToken: process.env.LOGS_BETTER_STACK_TOKEN }
    }.
    {
      level: "trace",
      target: "pino-pretty",
      options: {},
    },
  ],
})

export const logger = pino({}, transport)
