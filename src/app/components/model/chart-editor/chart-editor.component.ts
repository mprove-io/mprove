import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';
import * as uuid from 'uuid';

@Component({
  moduleId: module.id,
  selector: 'm-chart-editor',
  templateUrl: 'chart-editor.component.html',
  styleUrls: ['chart-editor.component.scss']
})
export class ChartEditorComponent {
  chartTypeEnum = api.ChartTypeEnum;
  chartViewSizeEnum = api.ChartViewSizeEnum;

  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  titleValid: boolean;
  viewWidthValid: boolean;
  viewHeightValid: boolean;

  constructor(
    private store: Store<interfaces.AppState>,
    private structService: services.StructService,
    private myDialogService: services.MyDialogService,
    private navigateMconfigService: services.NavigateService
  ) {}

  duplicateChart() {
    let newMconfig: api.Mconfig = this.structService.generateMconfig();

    let newChart = Object.assign({}, this.chart, {
      chart_id: uuid.v4()
    });

    newMconfig.charts = [...newMconfig.charts, newChart];

    this.store.dispatch(
      new actions.CreateMconfigAction({
        api_payload: {
          mconfig: newMconfig
        },
        navigate: () => {
          this.navigateMconfigService.navigateMconfigQueryChart(
            newMconfig.mconfig_id,
            newMconfig.query_id,
            newChart.chart_id
          );
        }
      })
    );
  }

  removeChart() {
    let newMconfig: api.Mconfig = this.structService.generateMconfig();

    let chartId: string;
    this.store
      .select(selectors.getSelectedMconfigChartId)
      .pipe(take(1))
      .subscribe(x => (chartId = x));

    let chartIndex = newMconfig.charts.findIndex(x => x.chart_id === chartId);

    newMconfig.charts = [
      ...newMconfig.charts.slice(0, chartIndex),
      ...newMconfig.charts.slice(chartIndex + 1)
    ];

    this.store.dispatch(
      new actions.CreateMconfigAction({
        api_payload: {
          mconfig: newMconfig
        },
        navigate: () => {
          this.navigateMconfigService.navigateMconfigQueryData(
            newMconfig.mconfig_id,
            newMconfig.query_id
          );
        }
      })
    );
  }

  openGenerateBlockmlDialog() {
    this.myDialogService.showGenerateBlockmlDialog();
  }

  chartChange() {
    let newMconfig: api.Mconfig = this.structService.generateMconfig();

    let chartId: string;
    this.store
      .select(selectors.getSelectedMconfigChartId)
      .pipe(take(1))
      .subscribe(x => (chartId = x));

    let chartIndex = newMconfig.charts.findIndex(x => x.chart_id === chartId);

    newMconfig.charts = [
      ...newMconfig.charts.slice(0, chartIndex),
      ...newMconfig.charts.slice(chartIndex + 1),
      this.chart
    ];

    this.store.dispatch(
      new actions.CreateMconfigAction({
        api_payload: {
          mconfig: newMconfig
        },
        navigate: () => {
          this.navigateMconfigService.navigateMconfigQueryChart(
            newMconfig.mconfig_id,
            newMconfig.query_id,
            this.chart.chart_id
          );
        }
      })
    );
  }

  partChange(ev) {
    this.chart = ev.chart;

    this.chart.is_valid =
      ev.is_part_valid &&
      this.titleValid &&
      (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
        (this.viewHeightValid && this.viewWidthValid));

    this.chartChange();
  }

  delayChartChange(chart) {
    this.chart = chart;
    // wait until children components initialize and pass valid status to validate chart
    setTimeout(() => {
      this.chartChange();
    }, 0);
  }

  titleChange(ev) {
    this.titleValid = ev.titleValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  viewHeightChange(ev) {
    this.viewHeightValid = ev.viewHeightValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  viewWidthChange(ev) {
    this.viewWidthValid = ev.viewWidthValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }
}
