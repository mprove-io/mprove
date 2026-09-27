import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDuplicateMconfigAndQueryInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  oldMconfigId: string;
  setPivotDefaults?: boolean;
};

export type ToBackendDuplicateMconfigAndQueryRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDuplicateMconfigAndQueryInput;
};

export let zToBackendDuplicateMconfigAndQueryInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    oldMconfigId: z.string(),
    setPivotDefaults: z.boolean().nullish()
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryInput' });

export let zToBackendDuplicateMconfigAndQueryRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDuplicateMconfigAndQueryInput
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryRequest' });

assertTypesEqual<
  ToBackendDuplicateMconfigAndQueryInput,
  z.infer<typeof zToBackendDuplicateMconfigAndQueryInput>
>({ value: true });

assertTypesEqual<
  ToBackendDuplicateMconfigAndQueryRequest,
  z.infer<typeof zToBackendDuplicateMconfigAndQueryRequest>
>({ value: true });
