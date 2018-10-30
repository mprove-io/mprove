import * as api from '../../_index';

export interface ProjectsCheckProjectIdUniqueResponse200BodyPayload {
  project_id: string;
  is_unique: boolean;
  is_valid: boolean;
}
