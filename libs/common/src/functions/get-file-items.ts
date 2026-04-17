import type { DiskCatalogNode } from '#common/zod/disk/disk-catalog-node';
import type { FileItem } from '#common/zod/file-item';

export function getFileItems(item: { nodes: DiskCatalogNode[] }): FileItem[] {
  let { nodes } = item;

  let fileItems: FileItem[] = [];

  nodes.forEach(x => traverse({ fileItems: fileItems, node: x }));

  return fileItems;
}

function traverse(item: { fileItems: FileItem[]; node: DiskCatalogNode }) {
  let { node, fileItems: fileItems } = item;

  if (!node.isFolder && node.fileId) {
    let ar = node.id.split('/');

    let fileItem: FileItem = {
      fileName: ar[ar.length - 1],
      fileId: node.fileId,
      fileNodeId: node.id,
      parentPath: node.id.split('/').slice(1).slice(0, -1).join('/')
    };

    fileItems.push(fileItem);
  }

  if (node.children) {
    node.children.forEach(x => traverse({ fileItems: fileItems, node: x }));
  }
}
