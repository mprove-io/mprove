import { common } from '~blockml/barrels/common';

export function wrapField(item: {
  children: common.ModelNode[];
  node: common.ModelNode;
  wrappedFields: common.ModelField[];
  field: common.FieldAny;
  alias: string;
  fileName: string;
  filePath: string;
  isStoreModel: boolean;
}) {
  let {
    wrappedFields,
    field,
    alias,
    fileName,
    filePath,
    children,
    node,
    isStoreModel
  } = item;

  let fieldHidden = common.toBooleanFromLowercaseString(field.hidden);
  let fieldRequired = common.toBooleanFromLowercaseString(field.required);

  let modelField: common.ModelField = {
    id: isStoreModel === true ? `${field.name}` : `${alias}.${field.name}`,
    hidden: fieldHidden,
    required: fieldRequired,
    maxFractions: common.isDefined(field.max_fractions)
      ? Number(field.max_fractions)
      : undefined,
    label: field.label,
    fieldClass: field.fieldClass,
    result: field.result,
    formatNumber: field.format_number,
    currencyPrefix: field.currency_prefix,
    currencySuffix: field.currency_suffix,
    sqlName: isStoreModel === true ? `${field.name}` : `${alias}_${field.name}`,
    topId: node.id,
    topLabel: node.label,
    description: field.description,
    type: field.type,
    groupId: field.groupId,
    groupLabel: field.group_label,
    groupDescription: field.group_description,
    suggestModelDimension: field.suggest_model_dimension,
    detail: field.detail
  };

  wrappedFields.push(modelField);

  let fieldNode: common.ModelNode = {
    id: isStoreModel === true ? `${field.name}` : `${alias}.${field.name}`,
    label: field.label,
    description: field.description,
    hidden: fieldHidden,
    required: fieldRequired,
    isField: true,
    children: [],
    fieldFileName: fileName,
    fieldFilePath: filePath,
    fieldResult: field.result,
    fieldLineNum: field.name_line_num,
    nodeClass: field.fieldClass
  };

  if (common.isDefined(field.groupId)) {
    let groupNode = children.find(c =>
      isStoreModel === true
        ? c.id === `${field.groupId}`
        : c.id === `${alias}.${field.groupId}`
    );

    if (common.isDefined(groupNode)) {
      groupNode.children.push(fieldNode);
    } else {
      let newGroupNode: common.ModelNode = {
        id:
          isStoreModel === true
            ? `${field.groupId}`
            : `${alias}.${field.groupId}`,
        label: field.group_label,
        description: field.group_description,
        hidden: fieldHidden,
        required: false,
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
