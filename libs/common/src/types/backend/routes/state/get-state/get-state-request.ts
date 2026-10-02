import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetStateRequest = {
  operation: 'getState';
  traceId: string;
  idempotencyKey: string;
  input: {
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
};

export let zToBackendGetStateRequest = z
  .strictObject({
    operation: z.literal('getState'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
      .meta({ id: 'ToBackendGetStateInput' })
  })
  .meta({ id: 'ToBackendGetStateRequest' });

assertTypesEqual<
  ToBackendGetStateRequest,
  z.infer<typeof zToBackendGetStateRequest>
>({ value: true });
