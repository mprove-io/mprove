import { Result } from '@praha/byethrow';
import type { ModelFieldLeafTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ModelFieldLeafEnt } from '#backend/drizzle/postgres/schema/model-field-leafs';
import type { HashService } from '#backend/services/hash/hash.service';

export function modelFieldLeafTabToEnt(item: {
  tab: ModelFieldLeafTab;
  hashService: HashService;
}): Result.Result<ModelFieldLeafEnt, never> {
  let { tab, hashService } = item;

  let modelFieldLeafEnt: ModelFieldLeafEnt = {
    modelFieldLeafFullId: hashService.makeModelFieldLeafFullId({
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
