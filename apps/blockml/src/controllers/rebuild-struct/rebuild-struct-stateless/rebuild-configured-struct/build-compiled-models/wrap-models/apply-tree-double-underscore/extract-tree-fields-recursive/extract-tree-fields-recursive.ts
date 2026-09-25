import { DOUBLE_UNDERSCORE } from '#common/constants/top';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import type { ModelNode } from '#common/zod/blockml/model-node';

type TreeField = {
  fieldNode: ModelNode;
  fieldGroupNode?: ModelNode;
};

export type ExtractTreeFieldsOutput = {
  nodes: ModelNode[];
  treeFields: TreeField[];
};

export function extractTreeFieldsRecursive(item: {
  nodes: ModelNode[];
  fieldGroupNode?: ModelNode;
}): ExtractTreeFieldsOutput {
  let { nodes, fieldGroupNode } = item;
  let treeFields: TreeField[] = [];
  let remainingNodes: ModelNode[] = [];

  nodes.forEach(node => {
    let fieldName = node.id.split('.').at(-1) ?? '';
    let isTreeField =
      node.isField === true && fieldName.includes(DOUBLE_UNDERSCORE);

    if (isTreeField) {
      treeFields.push({
        fieldNode: node,
        fieldGroupNode: fieldGroupNode
      });
      return;
    }

    if (node.isField === false) {
      let nextFieldGroupNode =
        node.nodeClass === FieldClassEnum.Dimension ? node : fieldGroupNode;
      let result = extractTreeFieldsRecursive({
        nodes: node.children ?? [],
        fieldGroupNode: nextFieldGroupNode
      });
      node.children = result.nodes;
      treeFields.push(...result.treeFields);
    }

    let keepNode = node.isField === true || (node.children?.length ?? 0) > 0;
    if (keepNode) {
      remainingNodes.push(node);
    }
  });

  return { nodes: remainingNodes, treeFields: treeFields };
}
