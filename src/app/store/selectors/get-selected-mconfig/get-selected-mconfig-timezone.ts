import { createSelector } from '@ngrx/store';
import { getSelectedMconfig } from 'src/app/store/selectors/get-selected-mconfig/get-selected-mconfig';
import * as api from 'src/app/api/_index';

export const getSelectedMconfigTimezone = createSelector(
  getSelectedMconfig,
  (mconfig: api.Mconfig) => mconfig ? mconfig.timezone : undefined
);
