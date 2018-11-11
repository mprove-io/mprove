import { createSelector } from '@ngrx/store';
import { getLayoutChartId } from 'src/app/store/selectors/get-layout/get-layout-chart-id';
import { getSelectedMconfigCharts } from 'src/app/store/selectors/get-selected-mconfig/get-selected-mconfig-charts';
import * as api from 'src/app/api/_index';

export const getSelectedMconfigChart = createSelector(
  getSelectedMconfigCharts,
  getLayoutChartId,
  (charts: api.Chart[], chartId: string) => {

    if (charts && chartId) {
      let chartIndex = charts.findIndex((chart: api.Chart) => chart.chart_id === chartId);
      return chartIndex >= 0 ? charts[chartIndex] : undefined;

    } else {
      return undefined;
    }
  }
);
