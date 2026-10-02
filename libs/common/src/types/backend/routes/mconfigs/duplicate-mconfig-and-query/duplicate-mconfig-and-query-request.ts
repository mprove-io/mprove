import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDuplicateMconfigAndQueryRequest = {
  operation: 'duplicateMconfigAndQuery';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    oldMconfigId: string;
    setPivotDefaults?: boolean;
  };
};

export let zToBackendDuplicateMconfigAndQueryRequest = z
  .strictObject({
    operation: z.literal('duplicateMconfigAndQuery'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        oldMconfigId: z.string(),
        setPivotDefaults: z.boolean().nullish()
      })
      .meta({ id: 'ToBackendDuplicateMconfigAndQueryInput' })
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryRequest' });

assertTypesEqual<
  ToBackendDuplicateMconfigAndQueryRequest,
  z.infer<typeof zToBackendDuplicateMconfigAndQueryRequest>
>({ value: true });
