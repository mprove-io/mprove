import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

export function wrapField(item: {
  wrappedFields: common.ModelField[];
  field: interfaces.FieldAny;
  alias: string;
  fileName: string;
  filePath: string;
  children: common.ModelNode[];
  node: common.ModelNode;
}) {
  let {
    wrappedFields,
    field,
    alias,
    fileName,
    filePath,
    children,
    node
  } = item;

  let fieldHidden = helper.toBooleanFromLowercaseString(field.hidden);

  let modelField: common.ModelField = {
    id: `${alias}.${field.name}`,
    hidden: fieldHidden,
    label: field.label,
    fieldClass: field.fieldClass,
    result: field.result,
    formatNumber: field.format_number,
    currencyPrefix: field.currency_prefix,
    currencySuffix: field.currency_suffix,
    sqlName: `${alias}_${field.name}`,
    topId: node.id,
    topLabel: node.label,
    description: field.description,
    type: field.type,
    groupId: field.groupId,
    groupLabel: field.group_label,
    groupDescription: field.group_description
  };

  wrappedFields.push(modelField);

  let fieldNode: common.ModelNode = {
    id: `${alias}.${field.name}`,
    label: field.label,
    description: field.description,
    hidden: fieldHidden,
    isField: true,
    children: [],
    fieldFileName: fileName,
    fieldFilePath: filePath,
    fieldResult: field.result,
    fieldLineNum: field.name_line_num,
    nodeClass: field.fieldClass
  };

  if (common.isDefined(field.groupId)) {
    let groupNode = children.find(c => c.id === `${alias}.${field.groupId}`);

    if (common.isDefined(groupNode)) {
      groupNode.children.push(fieldNode);
    } else {
      let newGroupNode: common.ModelNode = {
        id: `${alias}.${field.groupId}`,
        label: field.group_label,
        description: field.group_description,
        hidden: fieldHidden,
        isField: false,
        children: [fieldNode],
        nodeClass: common.FieldClassEnum.Dimension
      };

      children.push(newGroupNode);
    }
  } else {
    // add field without grouping
    children.push(fieldNode);
  }

  return;
}
