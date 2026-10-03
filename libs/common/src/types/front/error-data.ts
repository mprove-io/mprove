import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ErrorData = {
  message?: any;
  description?: string;
  leftButtonText?: string;
  rightButtonText?: string;
  leftOnClickFnBindThis?: () => any;
  rightOnClickFnBindThis?: () => any;
  originalError?: any;
  reqUrl?: string;
  reqHeaders?: any;
  reqBody?: any;
  response?: any;
  skipLogToConsole?: boolean;
};

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

assertTypesEqual<ErrorData, z.infer<typeof zErrorData>>({ value: true });
