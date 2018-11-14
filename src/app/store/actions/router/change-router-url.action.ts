import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class ChangeRouterUrlAction implements Action {
  readonly type = actionTypes.CHANGE_ROUTER_URL;

  constructor(public payload: string) {}
}
