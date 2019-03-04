import { ModelField } from './model-field';
import { ModelNode } from './model-node';

export interface Model {
  project_id: string;
  repo_id: string;
  struct_id: string;
  model_id: string;
  content: string;
  access_users: string[];
  label: string;
  gr?: string;
  hidden: boolean;
  fields: ModelField[];
  nodes: ModelNode[];
  server_ts: number;
  description?: string;
}
