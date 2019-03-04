import * as actions from '@app/store-actions/actions';

export type ProjectsActions =
  | actions.UpdateProjectsStateAction
  | actions.RemoveProjectAction
  | actions.ResetProjectsStateAction;
