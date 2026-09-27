import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToDiskResponseMetadata<TOperation extends string> = {
  operation: TOperation;
  method: string;
  duration: number;
  traceId: string;
};

export let zToDiskResponseMetadata = z.object({
  operation: z.string(),
  method: z.string(),
  duration: z.number().nonnegative(),
  traceId: z.string()
});

assertTypesEqual<
  ToDiskResponseMetadata<string>,
  z.infer<typeof zToDiskResponseMetadata>
>({ value: true });
