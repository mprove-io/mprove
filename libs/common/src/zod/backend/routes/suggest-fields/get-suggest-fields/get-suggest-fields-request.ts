import { z } from 'zod';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

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
    parentType:
      | MconfigParentTypeEnum.Dashboard
      | MconfigParentTypeEnum.ChartDialogDashboard
      | MconfigParentTypeEnum.SuggestDimensionDashboard
      | MconfigParentTypeEnum.Report
      | MconfigParentTypeEnum.ChartDialogReport
      | MconfigParentTypeEnum.SuggestDimensionReport
      | MconfigParentTypeEnum.Chart
      | MconfigParentTypeEnum.SuggestDimensionChart
      | MconfigParentTypeEnum.SuggestDimensionModel
      | MconfigParentTypeEnum.Blank;
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
        parentType: z.enum(MconfigParentTypeEnum)
      })
      .meta({ id: 'ToBackendGetSuggestFieldsInput' })
  })
  .meta({ id: 'ToBackendGetSuggestFieldsRequest' });

assertTypesEqual<
  ToBackendGetSuggestFieldsRequest,
  z.infer<typeof zToBackendGetSuggestFieldsRequest>
>({ value: true });
