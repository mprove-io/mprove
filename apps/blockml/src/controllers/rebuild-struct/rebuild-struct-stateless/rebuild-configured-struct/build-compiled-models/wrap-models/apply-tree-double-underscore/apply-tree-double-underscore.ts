import { DOUBLE_UNDERSCORE } from '#common/constants/top';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ModelNode } from '#common/zod/blockml/model-node';

import {
  type ExtractTreeFieldsOutput,
  extractTreeFieldsRecursive
} from './extract-tree-fields-recursive/extract-tree-fields-recursive';
import { getLabel } from './get-label/get-label';

export function applyTreeDoubleUnderscore(item: {
  nodes: ModelNode[];
}): ModelNode[] {
  let { nodes } = item;
  let result: ExtractTreeFieldsOutput = extractTreeFieldsRecursive({
    nodes: nodes,
    fieldGroupNode: undefined
  });
  let treeNodes = result.nodes;

  result.treeFields.forEach(treeField => {
    let fieldNode = treeField.fieldNode;
    let fieldName = fieldNode.id.split('.').at(-1) ?? '';
    let treeParts = fieldName.split(DOUBLE_UNDERSCORE);
    let parentNode: ModelNode | undefined;

    let rootId = treeParts[0];
    let rootNode = treeNodes.find(node => node.id === rootId);
    let rootNodeIsDefined = isDefined(rootNode);

    if (!rootNodeIsDefined) {
      rootNode = {
        id: rootId,
        label: getLabel({ value: rootId }),
        description: undefined,
        hidden: false,
        required: false,
        isField: false,
        children: [],
        nodeClass: FieldClassEnum.Join
      };
      treeNodes.push(rootNode);
    }

    parentNode = rootNode;

    let fieldGroupNodeIsDefined = isDefined(treeField.fieldGroupNode);
    if (fieldGroupNodeIsDefined) {
      let fieldGroupNodeId = `${rootId}.${treeField.fieldGroupNode.label}`;
      let fieldGroupNode = parentNode.children.find(
        node => node.id === fieldGroupNodeId
      );
      let fieldGroupNodeExists = isDefined(fieldGroupNode);

      if (!fieldGroupNodeExists) {
        fieldGroupNode = {
          ...treeField.fieldGroupNode,
          id: fieldGroupNodeId,
          children: []
        };
        parentNode.children.push(fieldGroupNode);
      }

      parentNode = fieldGroupNode;
    }

    treeParts.slice(1, -1).forEach((treePart, index) => {
      let siblingNodes = parentNode?.children ?? [];
      let treePath = treeParts.slice(0, index + 2).join(DOUBLE_UNDERSCORE);
      let treeNodeId = `tree.${treePath}`;
      let treeNode = siblingNodes.find(node => node.id === treeNodeId);

      let treeNodeIsDefined = isDefined(treeNode);
      if (!treeNodeIsDefined) {
        treeNode = {
          id: treeNodeId,
          label: getLabel({ value: treePart }),
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: FieldClassEnum.Dimension
        };
        siblingNodes.push(treeNode);
      }

      parentNode = treeNode;
    });

    fieldNode.label = getLabel({ value: treeParts.at(-1) ?? '' });

    let parentNodeIsDefined = isDefined(parentNode);
    if (parentNodeIsDefined) {
      parentNode.children.push(fieldNode);
    }
  });

  return treeNodes;
}
