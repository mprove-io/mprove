import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

// Transport-only failure. Never part of a service's domain Result.
export type ToDiskInternalFailure = {
  type: 'InternalFailure';
  incidentId: string;
};

export let zToDiskInternalFailure = z.object({
  type: z.literal('InternalFailure'),
  incidentId: z.string().uuid()
});

assertTypesEqual<ToDiskInternalFailure, z.infer<typeof zToDiskInternalFailure>>(
  { value: true }
);
