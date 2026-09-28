import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendResponseMetadata<TOperation extends string> = {
  operation: TOperation;
  method: string;
  duration: number;
  traceId: string;
  mproveVersion: string;
};

export let zToBackendResponseMetadata = z.object({
  operation: z.string(),
  method: z.string(),
  duration: z.number().nonnegative(),
  traceId: z.string(),
  mproveVersion: z.string()
});

assertTypesEqual<
  ToBackendResponseMetadata<string>,
  z.infer<typeof zToBackendResponseMetadata>
>({ value: true });
