import { DiskCatalogNode } from '~common/interfaces/disk/disk-catalog-node';
import { FileItem } from '~common/interfaces/file-item';

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

    let fileName = ar[ar.length - 1];

    let fileItem: FileItem = {
      fileNodeId: node.id,
      fileId: node.fileId,
      label: fileName
    };

    fileItems.push(fileItem);
  }
  if (node.children) {
    node.children.forEach(x => traverse({ fileItems: fileItems, node: x }));
  }
}
