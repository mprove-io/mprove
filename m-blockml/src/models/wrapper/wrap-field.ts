import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';

export function wrapField(item: {
  wrappedFields: api.ModelField[];
  field: interfaces.FieldAny;
  alias: string;
  fileName: string;
  children: api.ModelNode[];
  node: api.ModelNode;
}) {
  let wrappedFields = item.wrappedFields;
  let field = item.field;
  let alias = item.alias;
  let children = item.children;
  let node = item.node;

  let fieldHidden = helper.toBoolean(field.hidden);

  let forceDims: string[] = [];

  if (helper.isDefined(field.forceDims)) {
    Object.keys(field.forceDims).forEach(asName => {
      Object.keys(field.forceDims[asName]).forEach(dim => {
        forceDims.push(`${asName}.${dim}`);
      });
    });
  }

  let modelField: api.ModelField = {
    id: `${alias}.${field.name}`,
    hidden: fieldHidden,
    label: field.label,
    fieldClass: <any>field.fieldClass,
    result: <any>field.result,
    formatNumber: field.format_number,
    currencyPrefix: field.currency_prefix,
    currencySuffix: field.currency_suffix,
    sqlName: `${alias}_${field.name}`,
    topId: node.id,
    topLabel: node.label,
    forceDims: forceDims,
    description: field.description,
    type: <any>field.type,
    groupId: field.groupId,
    groupLabel: field.group_label,
    groupDescription: field.group_description
  };

  wrappedFields.push(modelField);

  let fieldNode: api.ModelNode = {
    id: `${alias}.${field.name}`,
    label: field.label,
    description: field.description,
    hidden: fieldHidden,
    isField: true,
    children: [],
    fieldFileName: item.fileName,
    fieldLineNum: field.name_line_num,
    nodeClass: <any>field.fieldClass
  };

  if (helper.isDefined(field.groupId)) {
    let groupNode = children.find(c => c.id === `${alias}.${field.groupId}`);

    if (helper.isDefined(groupNode)) {
      groupNode.children.push(fieldNode);
    } else {
      let newGroupNode: api.ModelNode = {
        id: `${alias}.${field.groupId}`,
        label: field.group_label,
        description: field.group_description,
        hidden: fieldHidden,
        isField: false,
        children: [fieldNode],
        nodeClass: api.ModelNodeNodeClassEnum.Dimension
      };

      children.push(newGroupNode);
    }
  } else {
    // add field without grouping
    children.push(fieldNode);
  }

  return;
}
