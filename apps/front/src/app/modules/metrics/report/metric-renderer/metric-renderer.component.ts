import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { tap } from 'rxjs';
import { STORE_MODEL_PREFIX } from '~common/_index';
import { DataRow } from '~front/app/interfaces/data-row';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { common } from '~front/barrels/common';

@Component({
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

  showJson = false;
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
    private metricsQuery: MetricsQuery,
    private uiQuery: UiQuery,
    private reportQuery: ReportQuery
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
      this.metric = this.metricsQuery
        .getValue()
        .metrics.find(y => y.metricId === this.params.data.metricId);

      if (this.metric.type === common.MetricTypeEnum.Model) {
        let timeSpec = this.reportQuery.getValue().timeSpec;

        let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

        let timeFieldIdSpec = `${this.metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

        this.parametersFilters = this.metric.modelId.startsWith(
          STORE_MODEL_PREFIX
        )
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
}
