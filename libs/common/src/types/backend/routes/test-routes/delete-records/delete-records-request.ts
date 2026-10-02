import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteRecordsRequest = {
  operation: 'deleteRecords';
  traceId: string;
  idempotencyKey: string;
  input: {
    emails?: string[];
    orgNames?: string[];
    orgIds?: string[];
    projectNames?: string[];
    projectIds?: string[];
    structIds?: string[];
  };
};

export let zToBackendDeleteRecordsRequest = z
  .strictObject({
    operation: z.literal('deleteRecords'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        emails: z.array(z.string()).nullish(),
        orgNames: z.array(z.string()).nullish(),
        orgIds: z.array(z.string()).nullish(),
        projectNames: z.array(z.string()).nullish(),
        projectIds: z.array(z.string()).nullish(),
        structIds: z.array(z.string()).nullish()
      })
      .meta({ id: 'ToBackendDeleteRecordsInput' })
  })
  .meta({ id: 'ToBackendDeleteRecordsRequest' });

assertTypesEqual<
  ToBackendDeleteRecordsRequest,
  z.infer<typeof zToBackendDeleteRecordsRequest>
>({ value: true });
