import { AtomicType } from '@malloydata/malloy-interfaces';
import { common } from '~blockml/barrels/common';
import { FieldItem } from '~blockml/functions/source-to-field-items';

export function wrapFieldItem(item: {
  topNode: common.ModelNode;
  fieldItem: FieldItem;
  alias: string;
  fileName: string;
  filePath: string;
}) {
  let { fieldItem, alias, fileName, filePath, topNode } = item;

  let namePrefix =
    fieldItem.path.length === 0 ? '' : fieldItem.path.join('.') + '.';

  let fieldId = `${namePrefix}${fieldItem.field.name}`;

  let typeKind = ((fieldItem.field as any).type as AtomicType).kind;

  let result =
    typeKind === 'string_type'
      ? common.FieldResultEnum.String
      : typeKind === 'number_type'
        ? common.FieldResultEnum.Number
        : typeKind === 'boolean_type'
          ? common.FieldResultEnum.Boolean
          : typeKind === 'timestamp_type'
            ? common.FieldResultEnum.Timestamp
            : typeKind === 'date_type'
              ? common.FieldResultEnum.Date
              : typeKind === 'array_type'
                ? common.FieldResultEnum.Array
                : typeKind === 'record_type'
                  ? common.FieldResultEnum.Record
                  : typeKind === 'json_type'
                    ? common.FieldResultEnum.Json
                    : typeKind === 'sql_native_type'
                      ? common.FieldResultEnum.SqlNative
                      : undefined;

  let fieldClass =
    fieldItem.field.kind === 'dimension'
      ? common.FieldClassEnum.Dimension
      : fieldItem.field.kind === 'measure'
        ? common.FieldClassEnum.Measure
        : undefined;

  let fieldLabel = fieldItem.field.name
    .split('_')
    .map(k => common.capitalizeFirstLetter(k))
    .join(' ');

  let fieldSqlName = fieldItem.field.name;
  // let fieldSqlName = fieldItem.field.name.split('.').join('_');

  let modelField: common.ModelField = {
    id: fieldId,
    hidden: false,
    required: false,
    maxFractions: undefined,
    label: fieldLabel,
    fieldClass: fieldClass,
    result: result,
    formatNumber: undefined,
    currencyPrefix: undefined,
    currencySuffix: undefined,
    sqlName: fieldSqlName,
    topId: topNode.id,
    topLabel: topNode.label,
    description: undefined,
    type: undefined,
    groupId: undefined,
    groupLabel: undefined,
    groupDescription: undefined,
    suggestModelDimension: undefined,
    detail: undefined
  };

  // wrappedFields.push(modelField);

  let fieldNode: common.ModelNode = {
    id: fieldId,
    label: fieldLabel,
    description: undefined,
    hidden: false,
    required: false,
    isField: true,
    children: [],
    fieldFileName: fileName,
    fieldFilePath: filePath,
    fieldResult: result,
    fieldLineNum: 0,
    nodeClass: fieldClass
  };

  // if (common.isDefined(field.groupId)) {
  //   let groupNode = topNode.children.find(c =>
  //     isStoreModel === true
  //       ? c.id === `${field.groupId}`
  //       : c.id === `${alias}.${field.groupId}`
  //   );

  //   if (common.isDefined(groupNode)) {
  //     groupNode.children.push(fieldNode);
  //   } else {
  //     let newGroupNode: common.ModelNode = {
  //       id:
  //         isStoreModel === true
  //           ? `${field.groupId}`
  //           : `${alias}.${field.groupId}`,
  //       label: field.group_label,
  //       description: field.group_description,
  //       hidden: fieldHidden,
  //       required: false,
  //       isField: false,
  //       children: [fieldNode],
  //       nodeClass: common.FieldClassEnum.Dimension
  //     };

  //     topNode.children.push(newGroupNode);
  //   }
  // } else {
  // add field without grouping
  topNode.children.push(fieldNode);
  // }

  return modelField;
}
