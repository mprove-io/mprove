import { DiskCatalogNode } from '#common/interfaces/disk/disk-catalog-node';

export function getFileIds(item: { nodes: DiskCatalogNode[] }): string[] {
  let { nodes } = item;

  let fileIds: string[] = [];

  nodes.forEach(x => traverse({ fileIds: fileIds, node: x }));

  return fileIds;
}

function traverse(item: { fileIds: string[]; node: DiskCatalogNode }) {
  let { node, fileIds } = item;

  if (!node.isFolder && node.fileId) {
    fileIds.push(node.fileId);
  }
  if (node.children) {
    node.children.forEach(x => traverse({ fileIds: fileIds, node: x }));
  }
}
