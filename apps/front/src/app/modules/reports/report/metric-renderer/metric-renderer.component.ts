import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { tap } from 'rxjs';
import { TRIPLE_UNDERSCORE } from '#common/constants/top';
import { DetailUnitEnum } from '#common/enums/detail-unit.enum';
import { MetricTypeEnum } from '#common/enums/metric-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { getTimeSpecDetail } from '#common/functions/get-timespec-detail';
import { getTimeSpecWord } from '#common/functions/get-timespec-word';
import { isDefined } from '#common/functions/is-defined';
import { FilterX } from '#common/interfaces/backend/filter-x';
import { ModelMetricX } from '#common/interfaces/backend/model-metric-x';
import { DataRow } from '#common/interfaces/front/data-row';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { DataService } from '~front/app/services/data.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-metric-renderer',
  templateUrl: './metric-renderer.component.html'
})
export class MetricRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  rowTypeHeader = RowTypeEnum.Header;
  rowTypeMetric = RowTypeEnum.Metric;
  rowTypeFormula = RowTypeEnum.Formula;

  metric: ModelMetricX;

  metricTypeModel = MetricTypeEnum.Model;

  parametersFilters: FilterX[] = [];

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
    if (this.params.data.rowType === RowTypeEnum.Metric) {
      let struct = this.structQuery.getValue();

      this.metric = struct.metrics.find(
        y => y.metricId === this.params.data.metricId
      );

      if (this.metric.type === MetricTypeEnum.Model) {
        let timeSpec = this.reportQuery.getValue().timeSpec;

        let timeSpecWord = getTimeSpecWord({ timeSpec: timeSpec });

        let timeSpecDetail = getTimeSpecDetail({
          timeSpec: timeSpec,
          weekStart: struct.mproveConfig.weekStart
        });

        let timeFieldIdSpec =
          this.metric.modelType === ModelTypeEnum.Malloy
            ? timeSpecDetail === DetailUnitEnum.Timestamps
              ? `${this.metric.timeFieldId}_ts`
              : [
                    DetailUnitEnum.WeeksSunday,
                    DetailUnitEnum.WeeksMonday
                  ].indexOf(timeSpecDetail) > -1
                ? `${this.metric.timeFieldId}_week`
                : `${this.metric.timeFieldId}_${timeSpecDetail.slice(0, -1)}`
            : `${this.metric.timeFieldId}${TRIPLE_UNDERSCORE}${timeSpecWord}`;

        this.parametersFilters =
          this.metric.modelType === ModelTypeEnum.Store
            ? this.params.data.mconfig.extendedFilters
            : this.params.data.mconfig.extendedFilters.filter(
                filter => filter.fieldId !== timeFieldIdSpec
              );

        let listen: { [a: string]: string } = {};

        this.params.data.parameters.forEach(x => {
          if (isDefined(x.listen)) {
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
      [RowTypeEnum.Header, RowTypeEnum.Empty].indexOf(
        this.params.data.rowType
      ) < 0
    ) {
      event.stopPropagation();
    }

    if (this.params.data.rowType === RowTypeEnum.Metric) {
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
        isStoreModel: this.params.data.mconfig.modelType === ModelTypeEnum.Store
      });

      this.myDialogService.showChart({
        apiService: this.apiService,
        mconfig: this.params.data.mconfig,
        query: this.params.data.query,
        qData: qData,
        canAccessModel: this.params.data.hasAccessToModel,
        showNav: this.params.data.rowType === RowTypeEnum.Metric,
        isSelectValid: selectValidResult.isSelectValid,
        metricId: this.params.data.metricId,
        isToDuplicateQuery: true
      });
    } else if (this.params.data.rowType === RowTypeEnum.Formula) {
      let chartPointsData = this.uiQuery.getValue().chartPointsData;

      this.myDialogService.showChartFormula({
        row: this.params.data,
        chartPointsData: chartPointsData
      });
    }
  }
}
