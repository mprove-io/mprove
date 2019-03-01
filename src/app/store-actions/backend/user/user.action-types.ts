import { ngrxType } from '@app/ngrx/ngrx-type';

export const LOGIN_USER = ngrxType('LOGIN_USER');
export const LOGIN_USER_SUCCESS = ngrxType('LOGIN_USER_SUCCESS');
export const LOGIN_USER_FAIL = ngrxType('LOGIN_USER_FAIL');

export const LOGOUT_USER = ngrxType('LOGOUT_USER');
export const LOGOUT_USER_SUCCESS = ngrxType('LOGOUT_USER_SUCCESS');
export const LOGOUT_USER_FAIL = ngrxType('LOGOUT_USER_FAIL');

export const REGISTER_USER = ngrxType('REGISTER_USER');
export const REGISTER_USER_SUCCESS = ngrxType('REGISTER_USER_SUCCESS');
export const REGISTER_USER_FAIL = ngrxType('REGISTER_USER_FAIL');

export const SET_USER_NAME = ngrxType('SET_USER_NAME');
export const SET_USER_NAME_SUCCESS = ngrxType('SET_USER_NAME_SUCCESS');
export const SET_USER_NAME_FAIL = ngrxType('SET_USER_NAME_FAIL');

export const DELETE_USER = ngrxType('DELETE_USER');
export const DELETE_USER_SUCCESS = ngrxType('DELETE_USER_SUCCESS');
export const DELETE_USER_FAIL = ngrxType('DELETE_USER_FAIL');

export const SET_USER_THEMES = ngrxType('SET_USER_THEMES');
export const SET_USER_THEMES_SUCCESS = ngrxType('SET_USER_THEMES_SUCCESS');
export const SET_USER_THEMES_FAIL = ngrxType('SET_USER_THEMES_FAIL');

export const SET_USER_TIMEZONE = ngrxType('SET_USER_TIMEZONE');
export const SET_USER_TIMEZONE_SUCCESS = ngrxType('SET_USER_TIMEZONE_SUCCESS');
export const SET_USER_TIMEZONE_FAIL = ngrxType('SET_USER_TIMEZONE_FAIL');

export const VERIFY_USER_EMAIL = ngrxType('VERIFY_USER_EMAIL');
export const VERIFY_USER_EMAIL_SUCCESS = ngrxType('VERIFY_USER_EMAIL_SUCCESS');
export const VERIFY_USER_EMAIL_FAIL = ngrxType('VERIFY_USER_EMAIL_FAIL');

export const CONFIRM_USER_EMAIL = ngrxType('CONFIRM_USER_EMAIL');
export const CONFIRM_USER_EMAIL_SUCCESS = ngrxType(
  'CONFIRM_USER_EMAIL_SUCCESS'
);
export const CONFIRM_USER_EMAIL_FAIL = ngrxType('CONFIRM_USER_EMAIL_FAIL');

export const UPDATE_USER_PASSWORD = ngrxType('UPDATE_USER_PASSWORD');
export const UPDATE_USER_PASSWORD_SUCCESS = ngrxType(
  'UPDATE_USER_PASSWORD_SUCCESS'
);
export const UPDATE_USER_PASSWORD_FAIL = ngrxType('UPDATE_USER_PASSWORD_FAIL');

export const RESET_USER_PASSWORD = ngrxType('RESET_USER_PASSWORD');
export const RESET_USER_PASSWORD_SUCCESS = ngrxType(
  'RESET_USER_PASSWORD_SUCCESS'
);
export const RESET_USER_PASSWORD_FAIL = ngrxType('RESET_USER_PASSWORD_FAIL');

export const SET_USER_PICTURE = ngrxType('SET_USER_PICTURE');
export const SET_USER_PICTURE_SUCCESS = ngrxType('SET_USER_PICTURE_SUCCESS');
export const SET_USER_PICTURE_FAIL = ngrxType('SET_USER_PICTURE_FAIL');
