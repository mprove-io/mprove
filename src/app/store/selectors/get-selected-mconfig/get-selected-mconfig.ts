import { createSelector } from '@ngrx/store';
import { getLayoutMconfigId } from '@app/store/selectors/get-layout/get-layout-mconfig-id';
import { getMconfigsState } from '@app/store/selectors/get-state/get-mconfigs-state';
import * as api from '@app/api/_index';

export const getSelectedMconfig = createSelector(
  getMconfigsState,
  getLayoutMconfigId,
  (mconfigs: api.Mconfig[], mconfigId: string) => {
    if (mconfigs && mconfigId) {
      let mconfig = mconfigs.find(
        (mc: api.Mconfig) => mc.mconfig_id === mconfigId
      );

      return mconfig ? mconfig : undefined;
    } else {
      return undefined;
    }
  }
);
