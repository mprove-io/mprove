import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type MconfigX, zMconfigX } from '#common/zod/backend/mconfig-x';

export type ToBackendSaveCreateChartInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  fromChartId: string;
  newChartId: string;
  tileTitle: string;
  space?: string;
  accessRoles: string[];
  mconfig: MconfigX;
};

export type ToBackendSaveCreateChartRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSaveCreateChartInput;
};

export let zToBackendSaveCreateChartInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromChartId: z.string(),
    newChartId: z.string(),
    tileTitle: z.string(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    mconfig: zMconfigX
  })
  .meta({ id: 'ToBackendSaveCreateChartInput' });

export let zToBackendSaveCreateChartRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSaveCreateChartInput
  })
  .meta({ id: 'ToBackendSaveCreateChartRequest' });

assertTypesEqual<
  ToBackendSaveCreateChartInput,
  z.infer<typeof zToBackendSaveCreateChartInput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveCreateChartRequest,
  z.infer<typeof zToBackendSaveCreateChartRequest>
>({ value: true });
