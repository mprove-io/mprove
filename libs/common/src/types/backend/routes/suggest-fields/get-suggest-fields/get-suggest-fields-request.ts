import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import { zMconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';

export type ToBackendGetSuggestFieldsRequest = {
  operation: 'getSuggestFields';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    parentId: string;
    parentType: MconfigParentType;
  };
};

export let zToBackendGetSuggestFieldsRequest = z
  .strictObject({
    operation: z.literal('getSuggestFields'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        parentId: z.string(),
        parentType: zMconfigParentType
      })
      .meta({ id: 'ToBackendGetSuggestFieldsInput' })
  })
  .meta({ id: 'ToBackendGetSuggestFieldsRequest' });

assertTypesEqual<
  ToBackendGetSuggestFieldsRequest,
  z.infer<typeof zToBackendGetSuggestFieldsRequest>
>({ value: true });
