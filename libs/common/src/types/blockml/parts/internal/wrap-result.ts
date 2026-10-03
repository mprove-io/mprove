import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type WrapResult<T> = {
  data: T;
  durationMs: number;
  error: any;
  errorStr: string;
};

type WrapResultSchema<T extends z.ZodType> = z.ZodObject<{
  data: T;
  durationMs: z.ZodNumber;
  error: z.ZodAny;
  errorStr: z.ZodString;
}>;

export let zfWrapResult = <T extends z.ZodType>(item: {
  zT: T;
}): WrapResultSchema<T> => {
  let { zT } = item;

  let schema: WrapResultSchema<T> = z
    .object({
      data: zT,
      durationMs: z.number(),
      error: z.any(),
      errorStr: z.string()
    })
    .meta({ id: 'WrapResult' });

  return schema;
};

// Zod's generic optional-key calculation cannot reduce until T is concrete.
// Check an instantiated output without annotating it as the native type.
assertTypesEqual<
  WrapResult<string>,
  z.infer<ReturnType<typeof zfWrapResult<z.ZodString>>>
>({ value: true });
