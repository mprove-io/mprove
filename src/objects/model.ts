import * as api from '../_index';

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
  fields: api.ModelField[];
  nodes: api.ModelNode[];
  server_ts: number;
  description?: string;
}
