import { z } from 'zod';

export let zfWrapResult = <T extends z.ZodType>(zT: T) =>
  z
    .object({
      data: zT,
      durationMs: z.number(),
      error: z.any(),
      errorStr: z.string()
    })
    .meta({ id: 'WrapResult' });

// TODO: remove this type export once zod exposes a way to parameterize
// generic schemas at the type level. Blockml needs `WrapResult<MalloyModel>`
// and the `zfWrapResult` factory cannot express that without a type alias.
export type WrapResult<T> = {
  data: T;
  durationMs: number;
  error: any;
  errorStr: string;
};
