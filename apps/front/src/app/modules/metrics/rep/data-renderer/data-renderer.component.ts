import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { QueryService } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-data-renderer',
  templateUrl: './data-renderer.component.html'
})
export class DataRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  rowTypeMetric = common.RowTypeEnum.Metric;
  formattedValue: string;
  isError = false;

  agInit(params: ICellRendererParams<DataRow>) {
    this.applyFormat(params);
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.applyFormat(params);
    return true;
  }

  applyFormat(params: ICellRendererParams<DataRow>) {
    this.params = params;
    let rowDataRecord = params.data.records.find(
      x => x.key === Number(params.colDef.field)
    );

    this.isError = common.isDefined(rowDataRecord?.error);

    this.formattedValue =
      this.isError === false && common.isDefined(params.value)
        ? this.queryService.formatValue({
            value: params.value,
            formatNumber: params.data.formatNumber,
            fieldResult: common.FieldResultEnum.Number,
            currencyPrefix: params.data.currencyPrefix,
            currencySuffix: params.data.currencySuffix
          })
        : this.isError === true
        ? rowDataRecord.error
        : undefined;
  }

  clickData() {
    if (
      common.isDefined(this.params.data.mconfig) &&
      this.params.data.rowType === common.RowTypeEnum.Metric
    ) {
      let metric = this.metricsQuery
        .getValue()
        .metrics.find(y => y.metricId === this.params.data.metricId);

      let timeSpec = this.repQuery.getValue().timeSpec;

      let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

      let timeFieldIdSpec = `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

      let newMconfigId = common.makeId();
      let newQueryId = common.makeId();

      let mconfigCopy = common.makeCopy(this.params.data.mconfig);

      let mconfig = Object.assign(mconfigCopy, <common.MconfigX>{
        mconfigId: newMconfigId,
        queryId: newQueryId,
        temp: true,
        serverTs: 1
      });

      let timeFilter = mconfig.filters.find(
        filter => filter.fieldId === timeFieldIdSpec
      );

      // let newFraction = {
      //   // brick: `on ${this.getYearStr({ dateValue: this.dateStr })}`,
      //   brick: `on 2023`,
      //   operator: common.FractionOperatorEnum.Or,
      //   type: common.FractionTypeEnum.TsIsOnYear,
      //   // tsDateYear: Number(this.dateStr.split('-')[0])
      //   tsDateYear: Number(2023)
      // };

      // timeFilter.fractions = [newFraction];

      let newMconfig = mconfig;

      this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
    }
  }

  constructor(
    private queryService: QueryService,
    private mconfigService: MconfigService,
    private metricsQuery: MetricsQuery,
    private repQuery: RepQuery
  ) {}
}
