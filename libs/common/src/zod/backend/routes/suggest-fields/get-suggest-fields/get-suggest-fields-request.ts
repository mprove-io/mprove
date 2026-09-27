import { z } from 'zod';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetSuggestFieldsInput = {
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

export type ToBackendGetSuggestFieldsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetSuggestFieldsInput;
};

export let zToBackendGetSuggestFieldsInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    parentId: z.string(),
    parentType: z.enum(MconfigParentTypeEnum)
  })
  .meta({ id: 'ToBackendGetSuggestFieldsInput' });

export let zToBackendGetSuggestFieldsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetSuggestFieldsInput
  })
  .meta({ id: 'ToBackendGetSuggestFieldsRequest' });

assertTypesEqual<
  ToBackendGetSuggestFieldsInput,
  z.infer<typeof zToBackendGetSuggestFieldsInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetSuggestFieldsRequest,
  z.infer<typeof zToBackendGetSuggestFieldsRequest>
>({ value: true });
