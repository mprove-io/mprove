import { ngrxType } from '@app/ngrx/ngrx-type';

export const CANCEL_QUERIES = ngrxType('CANCEL_QUERIES');
export const CANCEL_QUERIES_SUCCESS = ngrxType('CANCEL_QUERIES_SUCCESS');
export const CANCEL_QUERIES_FAIL = ngrxType('CANCEL_QUERIES_FAIL');

export const RUN_QUERIES = ngrxType('RUN_QUERIES');
export const RUN_QUERIES_SUCCESS = ngrxType('RUN_QUERIES_SUCCESS');
export const RUN_QUERIES_FAIL = ngrxType('RUN_QUERIES_FAIL');

export const RUN_QUERIES_DRY = ngrxType('RUN_QUERIES_DRY');
export const RUN_QUERIES_DRY_SUCCESS = ngrxType('RUN_QUERIES_DRY_SUCCESS');
export const RUN_QUERIES_DRY_FAIL = ngrxType('RUN_QUERIES_DRY_FAIL');
