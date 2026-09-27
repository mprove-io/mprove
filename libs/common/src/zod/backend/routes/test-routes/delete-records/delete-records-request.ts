import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteRecordsInput = {
  emails?: string[];
  orgNames?: string[];
  orgIds?: string[];
  projectNames?: string[];
  projectIds?: string[];
  structIds?: string[];
};

export type ToBackendDeleteRecordsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteRecordsInput;
};

export let zToBackendDeleteRecordsInput = z
  .object({
    emails: z.array(z.string()).nullish(),
    orgNames: z.array(z.string()).nullish(),
    orgIds: z.array(z.string()).nullish(),
    projectNames: z.array(z.string()).nullish(),
    projectIds: z.array(z.string()).nullish(),
    structIds: z.array(z.string()).nullish()
  })
  .meta({ id: 'ToBackendDeleteRecordsInput' });

export let zToBackendDeleteRecordsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteRecordsInput
  })
  .meta({ id: 'ToBackendDeleteRecordsRequest' });

assertTypesEqual<
  ToBackendDeleteRecordsInput,
  z.infer<typeof zToBackendDeleteRecordsInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteRecordsRequest,
  z.infer<typeof zToBackendDeleteRecordsRequest>
>({ value: true });
