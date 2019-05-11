import { ModelField } from './model-field';
import { ModelNode } from './model-node';

export interface View {
  project_id: string;
  repo_id: string;
  struct_id: string;
  view_id: string;
  view_deps: string[];
  is_pdt: boolean;
  server_ts: number;
}
