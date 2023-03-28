import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { common } from '~front/barrels/common';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-parameters-renderer',
  templateUrl: './parameters-renderer.component.html'
})
export class ParametersRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;
  metric: common.MetricAny;

  rowTypeHeader = common.RowTypeEnum.Header;
  rowTypeMetric = common.RowTypeEnum.Metric;

  metricTypeModel = common.MetricTypeEnum.Model;

  parametersFilters: common.FilterX[] = [];

  showJson = false;

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
        let timeSpec = this.repQuery.getValue().timeSpec;

        let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

        let timeFieldIdSpec = `${this.metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

        this.parametersFilters =
          this.params.data.mconfig.extendedFilters.filter(
            filter => filter.fieldId !== timeFieldIdSpec
          );
      }
    }

    this.showJson = this.uiQuery.getValue().showParametersJson;
  }

  constructor(
    private cd: ChangeDetectorRef,
    private metricsQuery: MetricsQuery,
    private uiQuery: UiQuery,
    private repQuery: RepQuery
  ) {}
}
