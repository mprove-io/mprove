import { ngrxType } from '@app/ngrx/ngrx-type';

export const SET_PROJECT_CREDENTIALS = ngrxType('SET_PROJECT_CREDENTIALS');
export const SET_PROJECT_CREDENTIALS_SUCCESS = ngrxType(
  'SET_PROJECT_CREDENTIALS_SUCCESS'
);
export const SET_PROJECT_CREDENTIALS_FAIL = ngrxType(
  'SET_PROJECT_CREDENTIALS_FAIL'
);
