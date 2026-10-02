import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBlockmlResponseMetadata<TOperation extends string> = {
  operation: TOperation;
  method: string;
  duration: number;
  traceId: string;
};

export let zToBlockmlResponseMetadata = z.object({
  operation: z.string(),
  method: z.string(),
  duration: z.number().nonnegative(),
  traceId: z.string()
});

assertTypesEqual<
  ToBlockmlResponseMetadata<string>,
  z.infer<typeof zToBlockmlResponseMetadata>
>({ value: true });
