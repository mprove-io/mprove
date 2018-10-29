export interface ModelNode {
  id: string;
  label: string;
  description?: string;
  node_class: ModelNodeNodeClassEnum;
  view_name?: string;
  is_field: boolean;
  field_file_name?: string;
  field_line_num?: number;
  hidden: boolean;
  children?: Array<models.ModelNode>;
}