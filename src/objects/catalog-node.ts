export interface CatalogNode {
  id: string;
  is_folder: boolean;
  name: string;
  file_id?: string;
  children?: CatalogNode[];
}
