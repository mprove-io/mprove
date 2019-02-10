import * as actions from '@app/store-actions/_index';

export type ProjectsActions =
  | actions.UpdateProjectsStateAction
  | actions.RemoveProjectAction
  | actions.ResetProjectsStateAction;
