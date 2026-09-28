import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectInfoRequest = {
  operation: 'setProjectInfo';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    name?: string;
  };
};

export let zToBackendSetProjectInfoRequest = z
  .strictObject({
    operation: z.literal('setProjectInfo'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        name: z.string().nullish()
      })
      .meta({ id: 'ToBackendSetProjectInfoInput' })
  })
  .meta({ id: 'ToBackendSetProjectInfoRequest' });

assertTypesEqual<
  ToBackendSetProjectInfoRequest,
  z.infer<typeof zToBackendSetProjectInfoRequest>
>({ value: true });
