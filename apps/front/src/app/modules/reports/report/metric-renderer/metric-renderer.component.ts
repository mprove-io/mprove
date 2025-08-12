import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { tap } from 'rxjs';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { DataRow } from '~front/app/interfaces/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { DataService } from '~front/app/services/data.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-metric-renderer',
  templateUrl: './metric-renderer.component.html'
})
export class MetricRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  rowTypeHeader = common.RowTypeEnum.Header;
  rowTypeMetric = common.RowTypeEnum.Metric;
  rowTypeFormula = common.RowTypeEnum.Formula;

  metric: common.ModelMetric;

  metricTypeModel = common.MetricTypeEnum.Model;

  parametersFilters: common.FilterX[] = [];

  showParameters = false;

  showMetricsModelName = false;
  showMetricsTimeFieldName = false;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showMetricsModelName = x.showMetricsModelName;
      this.showMetricsTimeFieldName = x.showMetricsTimeFieldName;

      this.cd.detectChanges();
    })
  );

  listen: { [a: string]: string } = {};

  constructor(
    private cd: ChangeDetectorRef,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
    private reportQuery: ReportQuery,
    private dataService: DataService,
    private apiService: ApiService,
    private myDialogService: MyDialogService
  ) {}

  agInit(params: ICellRendererParams<DataRow>) {
    this.params = params;

    this.update(params);
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.update(params);

    return true;
  }

  update(params: ICellRendererParams<DataRow>) {
    this.params = params;
    if (this.params.data.rowType === common.RowTypeEnum.Metric) {
      let struct = this.structQuery.getValue();

      this.metric = struct.metrics.find(
        y => y.metricId === this.params.data.metricId
      );

      if (this.metric.type === common.MetricTypeEnum.Model) {
        let timeSpec = this.reportQuery.getValue().timeSpec;

        let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

        let timeSpecDetail = common.getTimeSpecDetail({
          timeSpec: timeSpec,
          weekStart: struct.weekStart
        });

        let timeFieldIdSpec =
          this.metric.modelType === common.ModelTypeEnum.Malloy
            ? timeSpecDetail === common.DetailUnitEnum.Timestamps
              ? `${this.metric.timeFieldId}_ts`
              : [
                    common.DetailUnitEnum.WeeksSunday,
                    common.DetailUnitEnum.WeeksMonday
                  ].indexOf(timeSpecDetail) > -1
                ? `${this.metric.timeFieldId}_week`
                : `${this.metric.timeFieldId}_${timeSpecDetail.slice(0, -1)}`
            : `${this.metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

        this.parametersFilters =
          this.metric.modelType === common.ModelTypeEnum.Store
            ? this.params.data.mconfig.extendedFilters
            : this.params.data.mconfig.extendedFilters.filter(
                filter => filter.fieldId !== timeFieldIdSpec
              );

        let listen: { [a: string]: string } = {};

        this.params.data.parameters.forEach(x => {
          if (common.isDefined(x.listen)) {
            listen[x.apply_to] = x.listen;
          }
        });

        this.listen = listen;
      }
    }

    this.showParameters = this.uiQuery.getValue().showMetricsParameters;
  }

  showDialog(event?: MouseEvent) {
    if (
      [common.RowTypeEnum.Header, common.RowTypeEnum.Empty].indexOf(
        this.params.data.rowType
      ) < 0
    ) {
      event.stopPropagation();
    }

    // console.log('this.params.data');
    // console.log(this.params.data);

    if (this.params.data.rowType === common.RowTypeEnum.Metric) {
      let qData =
        this.params.data.mconfig.queryId === this.params.data.query.queryId
          ? this.dataService.makeQData({
              query: this.params.data.query,
              mconfig: this.params.data.mconfig
            })
          : [];

      let selectValidResult = getSelectValid({
        chart: this.params.data.mconfig.chart,
        mconfigFields: this.params.data.mconfig.fields,
        isStoreModel:
          this.params.data.mconfig.modelType === common.ModelTypeEnum.Store
        // isStoreModel: this.params.data.mconfig.isStoreModel
      });

      this.myDialogService.showChart({
        apiService: this.apiService,
        mconfig: this.params.data.mconfig,
        query: this.params.data.query,
        qData: qData,
        canAccessModel: this.params.data.hasAccessToModel,
        showNav: this.params.data.rowType === common.RowTypeEnum.Metric,
        isSelectValid: selectValidResult.isSelectValid,
        dashboardId: undefined,
        chartId: undefined,
        metricId: this.params.data.metricId,
        isToDuplicateQuery: true
      });
    } else if (this.params.data.rowType === common.RowTypeEnum.Formula) {
      let chartPointsData = this.uiQuery.getValue().chartPointsData;

      this.myDialogService.showChartFormula({
        row: this.params.data,
        chartPointsData: chartPointsData
      });
    }
  }
}
