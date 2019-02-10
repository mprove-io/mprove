import { ngrxType } from '@app/ngrx/ngrx-type';

export const RESET_STATE = ngrxType('RESET_STATE');
export const PROCESS_STRUCTS = ngrxType('PROCESS_STRUCTS');
export const UPDATE_STATE = ngrxType('UPDATE_STATE');

export const UPDATE_DASHBOARDS_STATE = ngrxType('UPDATE_DASHBOARDS_STATE');
export const RESET_DASHBOARDS_STATE = ngrxType('RESET_DASHBOARDS_STATE');
export const CLEAN_DASHBOARDS_STATE = ngrxType('CLEAN_DASHBOARDS_STATE');

export const UPDATE_ERRORS_STATE = ngrxType('UPDATE_ERRORS_STATE');
export const RESET_ERRORS_STATE = ngrxType('RESET_ERRORS_STATE');
export const CLEAN_ERRORS_STATE = ngrxType('CLEAN_ERRORS_STATE');

export const UPDATE_FILES_STATE = ngrxType('[Files] Update Files State');
export const RESET_FILES_STATE = ngrxType('[Files] Reset Files State');
