import type {
  FieldDef as MalloyFieldDef,
  SourceDef as MalloySourceDef
} from '@malloydata/malloy';
import { getMalloyFieldName } from '#backend/services/blockml/build-model-field-leafs/collect-malloy-field-leaf-infos-from-source-recursive/get-malloy-field-name/get-malloy-field-name';
import { isDefined } from '#common/functions/is-defined/is-defined';
export type MalloyFieldLeafInfo = {
  fieldPath: string[];
  fieldDef: MalloyFieldDef;
  schemaName: string | undefined;
  tableName: string | undefined;
  columnName: string | undefined;
};
export function collectMalloyFieldLeafInfosFromSourceRecursive(item: {
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
      collectMalloyFieldLeafInfosFromSourceRecursive({
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
