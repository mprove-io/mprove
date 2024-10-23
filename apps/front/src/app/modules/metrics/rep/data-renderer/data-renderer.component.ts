import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { QueryService } from '~front/app/services/query.service';
import { TimeService } from '~front/app/services/time.service';
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
      let rowDataRecord = this.params.data.records.find(
        x => x.key === Number(this.params.colDef.field)
      );

      let ts = rowDataRecord.tsShifted * 1000;

      let { date, dateStr, timeStr } =
        this.timeService.getDateTimeStrFromEpochMs({
          ts: ts
        });

      let metric = this.metricsQuery
        .getValue()
        .metrics.find(y => y.metricId === this.params.data.metricId);

      let timeSpec = this.repQuery.getValue().timeSpec;

      let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

      let timeRangeFraction;

      let dateToStr;
      let timeToStr;

      if (timeSpecWord === common.TimeframeEnum.Year) {
        let nextYear = date.getFullYear() + 1;
        let nextYearDate = new Date(nextYear, 0, 1, 0, 0, 0, 0);

        let tsNextYear = nextYearDate.getTime();

        let yearTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextYear
        });

        dateToStr = yearTo.dateStr;
        timeToStr = yearTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Quarter) {
        let qMonth = date.getMonth(); // Months are 0-11

        let nextQuarterMonth = (Math.floor(qMonth / 3) * 3 + 3) % 12;

        let yearIncrement = qMonth >= 9 ? 1 : 0; // If current month is Oct-Dec, increment year

        let nextQuarterYear = date.getFullYear() + yearIncrement;

        let nextQuarterDate = new Date(
          nextQuarterYear,
          nextQuarterMonth,
          1,
          0,
          0,
          0,
          0
        );

        let tsNextQuarter = nextQuarterDate.getTime();

        let quarterTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextQuarter
        });

        dateToStr = quarterTo.dateStr;
        timeToStr = quarterTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Month) {
        let month = date.getMonth(); // Months are zero-based (0-11)

        let nextMonth = month === 11 ? 0 : month + 1;

        let yearTo =
          nextMonth === 0 ? date.getFullYear() + 1 : date.getFullYear();

        let nextMonthDate = new Date(yearTo, nextMonth, 1, 0, 0, 0, 0);

        let tsNextMonth = nextMonthDate.getTime();

        let monthTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextMonth
        });

        dateToStr = monthTo.dateStr;
        timeToStr = monthTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Week) {
        let tsNextWeek = ts + 7 * 24 * 60 * 60 * 1000;

        let weekTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextWeek
        });

        dateToStr = weekTo.dateStr;
        timeToStr = weekTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Date) {
        let tsNextDay = ts + 24 * 60 * 60 * 1000;

        let dayTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextDay
        });

        dateToStr = dayTo.dateStr;
        timeToStr = dayTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Hour) {
        let tsNextHour = ts + 60 * 60 * 1000;

        let hourTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextHour
        });

        dateToStr = hourTo.dateStr;
        timeToStr = hourTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Minute) {
        let tsNextMinute = ts + 60 * 1000;

        let minuteTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextMinute
        });

        dateToStr = minuteTo.dateStr;
        timeToStr = minuteTo.timeStr;
      }

      let minuteStr = this.timeService.getMinuteStr({
        dateValue: dateStr,
        timeValue: timeStr
      });

      let minuteToStr = this.timeService.getMinuteStr({
        dateValue: dateToStr,
        timeValue: timeToStr
      });

      timeRangeFraction = {
        brick: `on ${minuteStr} to ${minuteToStr}`,
        operator: common.FractionOperatorEnum.Or,
        type: common.FractionTypeEnum.TsIsInRange,
        tsDateYear: Number(dateStr.split('-')[0]),
        tsDateMonth: Number(dateStr.split('-')[1].replace(/^0+/, '')),
        tsDateDay: Number(dateStr.split('-')[2].replace(/^0+/, '')),
        tsDateHour: Number(timeStr.split(':')[0].replace(/^0+/, '')),
        tsDateMinute: Number(timeStr.split(':')[1].replace(/^0+/, '')),
        tsDateToYear: Number(dateToStr.split('-')[0]),
        tsDateToMonth: Number(dateToStr.split('-')[1].replace(/^0+/, '')),
        tsDateToDay: Number(dateToStr.split('-')[2].replace(/^0+/, '')),
        tsDateToHour: Number(timeToStr.split(':')[0].replace(/^0+/, '')),
        tsDateToMinute: Number(timeToStr.split(':')[1].replace(/^0+/, ''))
      };

      let newFraction = timeRangeFraction;

      let newMconfigId = common.makeId();
      let newQueryId = common.makeId();

      let mconfigCopy = common.makeCopy(this.params.data.mconfig);

      let newMconfig = Object.assign(mconfigCopy, <common.MconfigX>{
        mconfigId: newMconfigId,
        queryId: newQueryId,
        temp: true,
        serverTs: 1
      });

      newMconfig.filters = [
        ...newMconfig.filters,
        {
          fieldId: `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Time}`,
          fractions: [newFraction]
        }
      ].sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      );

      this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
    }
  }

  constructor(
    private queryService: QueryService,
    private mconfigService: MconfigService,
    private metricsQuery: MetricsQuery,
    private repQuery: RepQuery,
    private timeService: TimeService
  ) {}
}
