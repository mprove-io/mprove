import { Result } from '@praha/byethrow';
import type { ModelFieldLeafTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ModelFieldLeafEnt } from '#backend/drizzle/postgres/schema/model-field-leafs';

export function modelFieldLeafEntToTab(item: {
  ent: ModelFieldLeafEnt;
}): Result.Result<ModelFieldLeafTab, never> {
  let { ent } = item;

  let modelFieldLeaf: ModelFieldLeafTab = {
    structId: ent.structId,
    modelId: ent.modelId,
    modelType: ent.modelType,
    connectionId: ent.connectionId,
    connectionType: ent.connectionType,
    fieldId: ent.fieldId,
    fieldNameLc: ent.fieldNameLc,
    fieldPath: ent.fieldPath,
    fieldClass: ent.fieldClass,
    fieldResult: ent.fieldResult,
    fieldType: ent.fieldType,
    labelLc: ent.labelLc,
    descriptionLc: ent.descriptionLc,
    hidden: ent.hidden,
    required: ent.required,
    sqlNameLc: ent.sqlNameLc,
    topId: ent.topId,
    topLabel: ent.topLabel,
    groupId: ent.groupId,
    groupLabel: ent.groupLabel,
    malloyFieldNameLc: ent.malloyFieldNameLc,
    malloyFieldPath: ent.malloyFieldPath,
    malloyTags: ent.malloyTags,
    mproveTags: ent.mproveTags,
    schemaNameLc: ent.schemaNameLc,
    tableNameLc: ent.tableNameLc,
    columnNameLc: ent.columnNameLc,
    field: ent.field,
    malloyFieldDef: ent.malloyFieldDef,
    serverTs: ent.serverTs
  };

  return Result.succeed(modelFieldLeaf);
}
