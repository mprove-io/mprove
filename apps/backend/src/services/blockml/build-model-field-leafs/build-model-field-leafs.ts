import type { SourceDef as MalloySourceDef } from '@malloydata/malloy';
import type { ModelFieldLeafTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  collectMalloyFieldLeafInfosFromSourceRecursive,
  type MalloyFieldLeafInfo
} from '#backend/services/blockml/build-model-field-leafs/collect-malloy-field-leaf-infos-from-source-recursive/collect-malloy-field-leaf-infos-from-source-recursive';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Model } from '#common/types/blockml/parts/model/model';
export function buildModelFieldLeafs(item: {
  models: Model[];
}): ModelFieldLeafTab[] {
  let { models } = item;
  let rows: ModelFieldLeafTab[] = [];
  models.forEach(model => {
    let malloyFieldLeafInfos: MalloyFieldLeafInfo[] = [];
    if (model.type === 'Malloy') {
      let malloyModelDef = model.malloyModelDef;
      let sourceName = model.source;
      if (malloyModelDef?.contents && sourceName) {
        let sourceDef = malloyModelDef.contents[sourceName] as MalloySourceDef;
        if (sourceDef && 'fields' in sourceDef) {
          collectMalloyFieldLeafInfosFromSourceRecursive({
            sourceDef: sourceDef,
            parentPath: [],
            inheritedSchemaName: undefined,
            inheritedTableName: undefined,
            fieldLeafInfos: malloyFieldLeafInfos
          });
        }
      }
    }
    model.fields.forEach(field => {
      let malloyFieldPath = field.malloyFieldPath ?? [];
      let malloyFieldLeafInfo = malloyFieldLeafInfos.find(
        x => x.fieldPath.join('.') === malloyFieldPath.join('.')
      );
      let hasMalloyFieldLeafInfo = isDefined(malloyFieldLeafInfo);
      if (hasMalloyFieldLeafInfo === false) {
        malloyFieldLeafInfo = malloyFieldLeafInfos.find(
          x => x.fieldPath.at(-1) === field.malloyFieldName
        );
      }
      let fieldName = field.malloyFieldName ?? field.sqlName;
      let row: ModelFieldLeafTab = {
        structId: model.structId,
        modelId: model.modelId,
        modelType: model.type,
        connectionId: model.connectionId,
        connectionType: model.connectionType,
        fieldId: field.id,
        fieldNameLc: fieldName?.toLowerCase(),
        fieldPath: field.malloyFieldPath ?? [],
        fieldClass: field.fieldClass,
        fieldResult: field.result,
        fieldType: field.type,
        labelLc: field.label?.toLowerCase(),
        descriptionLc: field.description?.toLowerCase(),
        hidden: field.hidden,
        required: field.required,
        sqlNameLc: field.sqlName?.toLowerCase(),
        topId: field.topId,
        topLabel: field.topLabel,
        groupId: field.groupId,
        groupLabel: field.groupLabel,
        malloyFieldNameLc: field.malloyFieldName?.toLowerCase(),
        malloyFieldPath: field.malloyFieldPath,
        malloyTags: field.malloyTags,
        mproveTags: field.mproveTags,
        schemaNameLc: malloyFieldLeafInfo?.schemaName?.toLowerCase(),
        tableNameLc: malloyFieldLeafInfo?.tableName?.toLowerCase(),
        columnNameLc: malloyFieldLeafInfo?.columnName?.toLowerCase(),
        field: field,
        malloyFieldDef: malloyFieldLeafInfo?.fieldDef,
        serverTs: undefined
      };
      rows.push(row);
    });
  });
  return rows;
}
