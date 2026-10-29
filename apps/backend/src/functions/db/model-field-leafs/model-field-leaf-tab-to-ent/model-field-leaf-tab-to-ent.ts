import { Result } from '@praha/byethrow';
import type {
  ModelFieldLeafEnt,
  ModelFieldLeafTab
} from '#backend/drizzle/postgres/tables/model-field-leafs';
import { makeModelFieldLeafFullId } from '#backend/functions/hash/make-model-field-leaf-full-id/make-model-field-leaf-full-id';

export function modelFieldLeafTabToEnt(item: {
  tab: ModelFieldLeafTab;
}): Result.Result<ModelFieldLeafEnt, never> {
  let { tab } = item;

  let modelFieldLeafEnt: ModelFieldLeafEnt = {
    modelFieldLeafFullId: makeModelFieldLeafFullId({
      structId: tab.structId,
      modelId: tab.modelId,
      fieldId: tab.fieldId
    }),
    structId: tab.structId,
    modelId: tab.modelId,
    modelType: tab.modelType,
    connectionId: tab.connectionId,
    connectionType: tab.connectionType,
    fieldId: tab.fieldId,
    fieldNameLc: tab.fieldNameLc,
    fieldPath: tab.fieldPath,
    fieldClass: tab.fieldClass,
    fieldResult: tab.fieldResult,
    fieldType: tab.fieldType,
    labelLc: tab.labelLc,
    descriptionLc: tab.descriptionLc,
    hidden: tab.hidden,
    required: tab.required,
    sqlNameLc: tab.sqlNameLc,
    topId: tab.topId,
    topLabel: tab.topLabel,
    groupId: tab.groupId,
    groupLabel: tab.groupLabel,
    malloyFieldNameLc: tab.malloyFieldNameLc,
    malloyFieldPath: tab.malloyFieldPath,
    malloyTags: tab.malloyTags,
    mproveTags: tab.mproveTags,
    schemaNameLc: tab.schemaNameLc,
    tableNameLc: tab.tableNameLc,
    columnNameLc: tab.columnNameLc,
    field: tab.field,
    malloyFieldDef: tab.malloyFieldDef,
    serverTs: tab.serverTs
  };

  return Result.succeed(modelFieldLeafEnt);
}
