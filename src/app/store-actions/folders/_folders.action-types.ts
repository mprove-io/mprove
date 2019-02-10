import { ngrxType } from '@app/ngrx/ngrx-type';

export const CREATE_FOLDER = ngrxType('CREATE_FOLDER');
export const CREATE_FOLDER_SUCCESS = ngrxType('CREATE_FOLDER_SUCCESS');
export const CREATE_FOLDER_FAIL = ngrxType('CREATE_FOLDER_FAIL');

export const DELETE_FOLDER = ngrxType('DELETE_FOLDER');
export const DELETE_FOLDER_SUCCESS = ngrxType('DELETE_FOLDER_SUCCESS');
export const DELETE_FOLDER_FAIL = ngrxType('DELETE_FOLDER_FAIL');

export const RENAME_FOLDER = ngrxType('RENAME_FOLDER');
export const RENAME_FOLDER_SUCCESS = ngrxType('RENAME_FOLDER_SUCCESS');
export const RENAME_FOLDER_FAIL = ngrxType('RENAME_FOLDER_FAIL');
