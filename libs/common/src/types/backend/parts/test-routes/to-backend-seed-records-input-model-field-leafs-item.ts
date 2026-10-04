import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import { zFieldResult } from '#common/types/blockml/parts/field/field-result';
import type { ModelType } from '#common/types/blockml/parts/model/model-type';
import { zModelType } from '#common/types/blockml/parts/model/model-type';

export type ToBackendSeedRecordsInputModelFieldLeafsItem = {
  structId: string;
  modelId: string;
  modelType: ModelType;
  connectionId?: string;
  fieldId: string;
  fieldResult?: FieldResult;
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
    modelType: zModelType,
    connectionId: z.string().nullish(),
    fieldId: z.string(),
    fieldResult: zFieldResult.nullish(),
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
