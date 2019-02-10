import { ngrxType } from '@app/ngrx/ngrx-type';

export const CREATE_FILE = ngrxType('CREATE_FILE');
export const CREATE_FILE_SUCCESS = ngrxType('CREATE_FILE_SUCCESS');
export const CREATE_FILE_FAIL = ngrxType('CREATE_FILE_FAIL');

export const SAVE_FILE = ngrxType('SAVE_FILE');
export const SAVE_FILE_SUCCESS = ngrxType('SAVE_FILE_SUCCESS');
export const SAVE_FILE_FAIL = ngrxType('SAVE_FILE_FAIL');

export const DELETE_FILE = ngrxType('DELETE_FILE');
export const DELETE_FILE_SUCCESS = ngrxType('DELETE_FILE_SUCCESS');
export const DELETE_FILE_FAIL = ngrxType('DELETE_FILE_FAIL');

export const MOVE_FILE = ngrxType('MOVE_FILE');
export const MOVE_FILE_SUCCESS = ngrxType('MOVE_FILE_SUCCESS');
export const MOVE_FILE_FAIL = ngrxType('MOVE_FILE_FAIL');
