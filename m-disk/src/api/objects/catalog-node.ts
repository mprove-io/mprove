export class CatalogNode {
  id: string;
  isFolder: boolean;
  name: string;
  fileId?: string;
  children?: CatalogNode[];
}
