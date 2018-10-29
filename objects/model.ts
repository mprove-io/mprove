import * as api from '../_index';

export interface Model {
  project_id: string;
  repo_id: string;
  struct_id: string;
  model_id: string;
  content: string;
  access_users: Array<string>;
  label: string;
  gr?: string;
  hidden: boolean;
  fields: Array<api.ModelField>;
  nodes: Array<api.ModelNode>;
  server_ts: number;
  description?: string;
}