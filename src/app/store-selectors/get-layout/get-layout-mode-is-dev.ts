import { createSelector } from '@ngrx/store';
import { getLayoutMode } from '@app/store-selectors/get-layout/get-layout-mode';
import * as enums from '@app/enums/_index';

export const getLayoutModeIsDev = createSelector(
  getLayoutMode,
  mode => mode === enums.LayoutModeEnum.Dev
);
