import { ModelField } from './model-field';
import { ModelNode } from './model-node';

export class Model {
  projectId: string;
  repoId: string;
  structId: string;
  modelId: string;
  content: string;
  accessUsers: string[];
  label: string;
  gr?: string;
  hidden: boolean;
  fields: ModelField[];
  nodes: ModelNode[];
  description?: string;
  serverTs: number;
}
