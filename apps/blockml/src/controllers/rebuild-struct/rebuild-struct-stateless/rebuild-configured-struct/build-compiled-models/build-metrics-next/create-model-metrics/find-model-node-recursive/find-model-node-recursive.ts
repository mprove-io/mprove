import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ModelNode } from '#common/zod/blockml/model-node';

export type FindModelNodeOutput = {
  node: ModelNode;
  parentNode: ModelNode;
};

export function findModelNodeRecursive(item: {
  nodes: ModelNode[];
  nodeId: string;
  parentNode: ModelNode;
}): FindModelNodeOutput {
  let { nodes, nodeId, parentNode } = item;

  let foundNode: ModelNode = nodes.find(node => node.id === nodeId);

  if (isDefined(foundNode)) {
    let result: FindModelNodeOutput = {
      node: foundNode,
      parentNode: parentNode
    };

    return result;
  }

  let output: FindModelNodeOutput;

  nodes.forEach(node => {
    if (isDefined(output)) {
      return;
    }

    let children: ModelNode[] = node.children ?? [];

    output = findModelNodeRecursive({
      nodes: children,
      nodeId: nodeId,
      parentNode: node
    });
  });

  return output;
}
