import { ApRegex } from '../../barrels/am-regex';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function wrapField(item: {
  wrappedFields: api.ModelField[];
  field: interfaces.FieldExt;
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

  let fieldHidden =
    field.hidden && field.hidden.match(ApRegex.TRUE()) ? true : false;

  let forceDims: string[] = [];

  if (typeof field.force_dims !== 'undefined' && field.force_dims !== null) {
    Object.keys(field.force_dims).forEach(asName => {
      Object.keys(field.force_dims[asName]).forEach(dim => {
        forceDims.push(`${asName}.${dim}`);
      });
    });
  }

  wrappedFields.push({
    id: `${alias}.${field.name}`,
    hidden: fieldHidden,
    label: field.label,
    field_class: <any>field.field_class,
    result: <any>field.result,
    format_number: field.format_number,
    currency_prefix: field.currency_prefix,
    currency_suffix: field.currency_suffix,
    sql_name: `${alias}_${field.name}`,
    top_id: node.id,
    top_label: node.label,
    force_dims: forceDims,
    // not required:
    description: field.description,
    type: <any>field.type,
    group_id: field.group_id,
    group_label: field.group_label,
    group_description: field.group_description
  });

  if (typeof field.group_id !== 'undefined' && field.group_id !== null) {
    // field should be grouped
    // find index of group node
    let groupIndex = children.findIndex(
      c => c.id === `${alias}.${field.group_id}`
    );

    if (groupIndex < 0) {
      // group node not exists, add group node

      children.push({
        id: `${alias}.${field.group_id}`,
        label: field.group_label,
        description: field.group_description,
        hidden: fieldHidden,
        is_field: false,
        children: [],
        node_class: api.ModelNodeNodeClassEnum.Dimension
      });

      // find index of added group node
      let groupIndex2 = children.length - 1;

      // add nested field node
      children[groupIndex2].children.push({
        id: `${alias}.${field.name}`,
        label: field.label,
        description: field.description,
        hidden: fieldHidden,
        is_field: true,
        children: [],
        field_file_name: item.fileName,
        field_line_num: field.name_line_num,
        node_class: <any>field.field_class
      });
    } else {
      // group node exists, add nested field node
      children[groupIndex].children.push({
        id: `${alias}.${field.name}`,
        label: field.label,
        description: field.description,
        hidden: fieldHidden,
        is_field: true,
        children: [],
        field_file_name: item.fileName,
        field_line_num: field.name_line_num,
        node_class: <any>field.field_class
      });
    }
  } else {
    // add field without grouping
    children.push({
      id: `${alias}.${field.name}`,
      label: field.label,
      description: field.description,
      hidden: fieldHidden,
      is_field: true,
      children: [],
      field_file_name: item.fileName,
      field_line_num: field.name_line_num,
      node_class: <any>field.field_class
    });
  }

  return;
}
