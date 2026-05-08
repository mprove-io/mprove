import type {
  FieldDef as MalloyFieldDef,
  SourceDef as MalloySourceDef
} from '@malloydata/malloy';
import type { ModelFieldLeafTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { Model } from '#common/zod/blockml/model';

type MalloyFieldLeafInfo = {
  fieldPath: string[];
  fieldDef: MalloyFieldDef;
  schemaName: string | undefined;
  tableName: string | undefined;
  columnName: string | undefined;
};

export function buildModelFieldLeafs(item: {
  models: Model[];
}): ModelFieldLeafTab[] {
  let { models } = item;

  let rows: ModelFieldLeafTab[] = [];

  models.forEach(model => {
    let malloyFieldLeafInfos: MalloyFieldLeafInfo[] = [];

    if (model.type === ModelTypeEnum.Malloy) {
      let malloyModelDef = model.malloyModelDef;

      let sourceName = model.source;

      if (malloyModelDef?.contents && sourceName) {
        let sourceDef = malloyModelDef.contents[sourceName] as MalloySourceDef;

        if (sourceDef && 'fields' in sourceDef) {
          collectMalloyFieldLeafInfosFromSource({
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

      let row: ModelFieldLeafTab = {
        structId: model.structId,
        modelId: model.modelId,
        modelType: model.type,
        connectionId: model.connectionId,
        connectionType: model.connectionType,
        fieldId: field.id,
        fieldName: field.malloyFieldName ?? field.sqlName,
        fieldPath: field.malloyFieldPath ?? [],
        fieldClass: field.fieldClass,
        fieldResult: field.result,
        fieldType: field.type,
        label: field.label,
        description: field.description,
        hidden: field.hidden,
        required: field.required,
        sqlName: field.sqlName,
        topId: field.topId,
        topLabel: field.topLabel,
        groupId: field.groupId,
        groupLabel: field.groupLabel,
        malloyFieldName: field.malloyFieldName,
        malloyFieldPath: field.malloyFieldPath,
        malloyTags: field.malloyTags,
        mproveTags: field.mproveTags,
        schemaName: malloyFieldLeafInfo?.schemaName,
        tableName: malloyFieldLeafInfo?.tableName,
        columnName: malloyFieldLeafInfo?.columnName,
        field: field,
        malloyFieldDef: malloyFieldLeafInfo?.fieldDef,
        serverTs: undefined
      };

      rows.push(row);
    });
  });

  return rows;
}

function collectMalloyFieldLeafInfosFromSource(item: {
  sourceDef: MalloySourceDef | MalloyFieldDef;
  parentPath: string[];
  inheritedSchemaName: string | undefined;
  inheritedTableName: string | undefined;
  fieldLeafInfos: MalloyFieldLeafInfo[];
}) {
  let {
    sourceDef,
    parentPath,
    inheritedSchemaName,
    inheritedTableName,
    fieldLeafInfos
  } = item;

  let schemaName = inheritedSchemaName;

  let tableName = inheritedTableName;

  let isTableSource = sourceDef.type === 'table';

  if (isTableSource) {
    let tablePath = 'tablePath' in sourceDef ? sourceDef.tablePath : '';

    let tablePathParts = tablePath
      .split('.')
      .map(part => part.trim().replace(/^['"`]+|['"`]+$/g, ''))
      .filter(part => part.length > 0);

    schemaName = tablePathParts.length > 1 ? tablePathParts.at(-2) : undefined;

    tableName = tablePathParts.at(-1);
  }

  let fields: MalloyFieldDef[] = 'fields' in sourceDef ? sourceDef.fields : [];

  let hasFields = Array.isArray(fields);

  if (hasFields === false) {
    return;
  }

  fields.forEach(fieldDef => {
    let fieldName = getMalloyFieldName({ fieldDef: fieldDef });

    let hasFieldName = isDefined(fieldName);

    let fieldPath =
      hasFieldName === true ? parentPath.concat(fieldName) : parentPath;

    let childFields: MalloyFieldDef[] =
      'fields' in fieldDef ? fieldDef.fields : [];

    let hasChildFields = Array.isArray(childFields) && childFields.length > 0;

    if (hasChildFields === true) {
      collectMalloyFieldLeafInfosFromSource({
        sourceDef: fieldDef,
        parentPath: fieldPath,
        inheritedSchemaName: schemaName,
        inheritedTableName: tableName,
        fieldLeafInfos: fieldLeafInfos
      });
      return;
    }

    let columnName: string | undefined;

    if (!('e' in fieldDef) || fieldDef.e === undefined) {
      columnName = getMalloyFieldName({ fieldDef: fieldDef });
    } else if (fieldDef.e.node === 'field') {
      let isSimpleFieldReference = fieldDef.e.path.length === 1;

      if (isSimpleFieldReference === true) {
        columnName = fieldDef.e.path[0];
      }
    }

    fieldLeafInfos.push({
      fieldPath: fieldPath,
      fieldDef: fieldDef,
      schemaName: schemaName,
      tableName: tableName,
      columnName: columnName
    });
  });
}

function getMalloyFieldName(item: {
  fieldDef: MalloyFieldDef;
}): string | undefined {
  let { fieldDef } = item;

  let hasAs = 'as' in fieldDef && isDefined(fieldDef.as);

  if (hasAs === true) {
    return fieldDef.as;
  }

  let hasName = 'name' in fieldDef && isDefined(fieldDef.name);

  if (hasName === true) {
    return fieldDef.name;
  }

  return undefined;
}
