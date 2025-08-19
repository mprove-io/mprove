import { FieldClassEnum } from '~common/enums/field-class.enum';
import { isDefined } from '~common/functions/is-defined';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FieldAny } from '~common/interfaces/blockml/internal/field-any';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { ModelNode } from '~common/interfaces/blockml/model-node';

export function wrapField(item: {
  topNode: ModelNode;
  field: FieldAny;
  alias: string;
  fileName: string;
  filePath: string;
  isStoreModel: boolean;
}) {
  let { field, alias, fileName, filePath, topNode, isStoreModel } = item;

  let fieldHidden = toBooleanFromLowercaseString(field.hidden);
  let fieldRequired = toBooleanFromLowercaseString(field.required);

  let modelField: ModelField = {
    id: isStoreModel === true ? `${field.name}` : `${alias}.${field.name}`,
    hidden: fieldHidden,
    required: fieldRequired,
    maxFractions: isDefined(field.max_fractions)
      ? Number(field.max_fractions)
      : undefined,
    label: field.label,
    fieldClass: field.fieldClass,
    result: field.result,
    formatNumber: field.format_number,
    currencyPrefix: field.currency_prefix,
    currencySuffix: field.currency_suffix,
    sqlName: isStoreModel === true ? `${field.name}` : `${alias}_${field.name}`,
    topId: topNode.id,
    topLabel: topNode.label,
    description: field.description,
    type: field.type,
    groupId: field.groupId,
    groupLabel: field.group_label,
    groupDescription: field.group_description,
    suggestModelDimension: field.suggest_model_dimension,
    detail: field.detail
  };

  let fieldNode: ModelNode = {
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

  if (isDefined(field.groupId)) {
    let groupNode = topNode.children.find(c =>
      isStoreModel === true
        ? c.id === `${field.groupId}`
        : c.id === `${alias}.${field.groupId}`
    );

    if (isDefined(groupNode)) {
      groupNode.children.push(fieldNode);
    } else {
      let newGroupNode: ModelNode = {
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
        nodeClass: FieldClassEnum.Dimension
      };

      topNode.children.push(newGroupNode);
    }
  } else {
    // add field without grouping
    topNode.children.push(fieldNode);
  }

  return modelField;
}
