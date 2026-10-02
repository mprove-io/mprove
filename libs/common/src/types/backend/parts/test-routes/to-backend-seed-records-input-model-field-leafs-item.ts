import { z } from 'zod';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSeedRecordsInputModelFieldLeafsItem = {
  structId: string;
  modelId: string;
  modelType: ModelTypeEnum.Store | ModelTypeEnum.Malloy;
  connectionId?: string;
  fieldId: string;
  fieldResult?:
    | FieldResultEnum.DayOfWeek
    | FieldResultEnum.DayOfWeekIndex
    | FieldResultEnum.MonthName
    | FieldResultEnum.QuarterOfYear
    | FieldResultEnum.Ts
    | FieldResultEnum.Yesno
    | FieldResultEnum.String
    | FieldResultEnum.Number
    | FieldResultEnum.Date
    | FieldResultEnum.Boolean
    | FieldResultEnum.Array
    | FieldResultEnum.Record
    | FieldResultEnum.Json
    | FieldResultEnum.SqlNative;
  schemaNameLc?: string;
  tableNameLc?: string;
  columnNameLc?: string;
  fieldNameLc?: string;
  labelLc?: string;
  descriptionLc?: string;
  malloyFieldNameLc?: string;
  sqlNameLc?: string;
};

export let zToBackendSeedRecordsInputModelFieldLeafsItem = z
  .object({
    structId: z.string(),
    modelId: z.string(),
    modelType: z.enum(ModelTypeEnum),
    connectionId: z.string().nullish(),
    fieldId: z.string(),
    fieldResult: z.enum(FieldResultEnum).nullish(),
    schemaNameLc: z.string().nullish(),
    tableNameLc: z.string().nullish(),
    columnNameLc: z.string().nullish(),
    fieldNameLc: z.string().nullish(),
    labelLc: z.string().nullish(),
    descriptionLc: z.string().nullish(),
    malloyFieldNameLc: z.string().nullish(),
    sqlNameLc: z.string().nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsInputModelFieldLeafsItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputModelFieldLeafsItem,
  z.infer<typeof zToBackendSeedRecordsInputModelFieldLeafsItem>
>({ value: true });
