import { createSelector } from '@ngrx/store';
import { getSelectedMconfigChart } from 'app/store/selectors/get-selected-mconfig-chart/get-selected-mconfig-chart';
import * as api from 'app/api/_index';

export const getSelectedMconfigChartType = createSelector(
  getSelectedMconfigChart,
  (chart: api.Chart) => (chart ? chart.type : undefined)
);
