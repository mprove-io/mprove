import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetStateInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  isFetch: boolean;
  getErrors: boolean;
  getRepo: boolean;
  getRepoNodes: boolean;
  getModels: boolean;
  getDashboards: boolean;
  getCharts: boolean;
  getMetrics: boolean;
  getReports: boolean;
};

export type ToBackendGetStateRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetStateInput;
};

export let zToBackendGetStateInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    isFetch: z.boolean(),
    getErrors: z.boolean(),
    getRepo: z.boolean(),
    getRepoNodes: z.boolean(),
    getModels: z.boolean(),
    getDashboards: z.boolean(),
    getCharts: z.boolean(),
    getMetrics: z.boolean(),
    getReports: z.boolean()
  })
  .meta({ id: 'ToBackendGetStateInput' });

export let zToBackendGetStateRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetStateInput
  })
  .meta({ id: 'ToBackendGetStateRequest' });

assertTypesEqual<
  ToBackendGetStateInput,
  z.infer<typeof zToBackendGetStateInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetStateRequest,
  z.infer<typeof zToBackendGetStateRequest>
>({ value: true });
