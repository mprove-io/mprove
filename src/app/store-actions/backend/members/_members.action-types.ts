import { ngrxType } from '@app/ngrx/ngrx-type';

export const CREATE_MEMBER = ngrxType('CREATE_MEMBER');
export const CREATE_MEMBER_SUCCESS = ngrxType('CREATE_MEMBER_SUCCESS');
export const CREATE_MEMBER_FAIL = ngrxType('CREATE_MEMBER_FAIL');

export const EDIT_MEMBER = ngrxType('EDIT_MEMBER');
export const EDIT_MEMBER_SUCCESS = ngrxType('EDIT_MEMBER_SUCCESS');
export const EDIT_MEMBER_FAIL = ngrxType('EDIT_MEMBER_FAIL');

export const DELETE_MEMBER = ngrxType('DELETE_MEMBER');
export const DELETE_MEMBER_SUCCESS = ngrxType('DELETE_MEMBER_SUCCESS');
export const DELETE_MEMBER_FAIL = ngrxType('DELETE_MEMBER_FAIL');
