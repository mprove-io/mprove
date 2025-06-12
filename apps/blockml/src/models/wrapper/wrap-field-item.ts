import { AtomicType } from '@malloydata/malloy-interfaces';
import { common } from '~blockml/barrels/common';
import { FieldItem } from '~blockml/functions/source-to-field-items';

export function wrapFieldItem(item: {
  topNode: common.ModelNode;
  fieldItem: FieldItem;
  alias: string;
  fileName: string;
  filePath: string;
  isStoreModel: boolean;
}) {
  let { fieldItem, alias, fileName, filePath, topNode, isStoreModel } = item;

  let namePrefix =
    fieldItem.path.length === 0 ? '' : fieldItem.path.join('.') + '.';

  let fieldId = `${namePrefix}${fieldItem.field.name}`;

  // "string_type" | "boolean_type" | "number_type" | "json_type" | "sql_native_type" | "date_type" | "timestamp_type" | "array_type" | "record_type"
  let typeKind = ((fieldItem.field as any).type as AtomicType).kind;

  let result =
    typeKind === 'string_type'
      ? common.FieldResultEnum.String
      : typeKind === 'number_type'
        ? common.FieldResultEnum.Number
        : undefined;

  let fieldClass =
    fieldItem.field.kind === 'dimension'
      ? common.FieldClassEnum.Dimension
      : fieldItem.field.kind === 'measure'
        ? common.FieldClassEnum.Measure
        : undefined;

  let modelField: common.ModelField = {
    id: fieldId,
    hidden: false,
    required: false,
    maxFractions: undefined,
    label: fieldItem.field.name,
    fieldClass: fieldClass,
    result: result,
    formatNumber: undefined,
    currencyPrefix: undefined,
    currencySuffix: undefined,
    sqlName: fieldItem.field.name.split('.').join('_'),
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
    label: fieldItem.field.name,
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
