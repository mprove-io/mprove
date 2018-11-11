import { MetaReducer } from '@ngrx/store';
/**
 * storeFreeze prevents state from being mutated. When mutation occurs, an
 * exception will be thrown. This is useful during development mode to
 * ensure that none of the reducers accidentally mutates the state.
 */
import { storeFreeze } from 'ngrx-store-freeze';
import { storeLogger } from 'ngrx-store-logger';
import * as interfaces from 'src/app/interfaces/_index';
import * as metaReducers from 'src/app/store/meta-reducers/_index';


/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export const APP_META_REDUCERS_ARRAY: Array<MetaReducer<interfaces.AppState>> =
  ENV === 'development'
    ? [metaReducers.segmentMetaReducer, storeLogger({ collapsed: true }), storeFreeze]
    : [metaReducers.segmentMetaReducer];
