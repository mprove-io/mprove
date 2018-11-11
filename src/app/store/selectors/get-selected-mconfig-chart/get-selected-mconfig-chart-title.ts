import { createSelector } from '@ngrx/store';
import { getSelectedMconfigChart } from 'src/app/store/selectors/get-selected-mconfig-chart/get-selected-mconfig-chart';
import * as api from 'src/app/api/_index';

export const getSelectedMconfigChartTitle = createSelector(
  getSelectedMconfigChart,
  (chart: api.Chart) => chart ? chart.title : undefined
);
