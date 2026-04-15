import { z } from 'zod';

export let zErrorData = z
  .object({
    message: z.any().nullish(),
    description: z.string().nullish(),
    leftButtonText: z.string().nullish(),
    rightButtonText: z.string().nullish(),
    leftOnClickFnBindThis: z.custom<() => any>().nullish(),
    rightOnClickFnBindThis: z.custom<() => any>().nullish(),
    originalError: z.any().nullish(),
    reqUrl: z.string().nullish(),
    reqHeaders: z.any().nullish(),
    reqBody: z.any().nullish(),
    response: z.any().nullish(),
    skipLogToConsole: z.boolean().nullish()
  })
  .meta({ id: 'ErrorData' });

export type ErrorData = z.infer<typeof zErrorData>;
