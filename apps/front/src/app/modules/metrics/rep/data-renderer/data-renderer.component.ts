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

      let timeFieldIdSpec = `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

      let timeRangeFraction;

      if (
        timeSpecWord === common.TimeframeEnum.Week ||
        timeSpecWord === common.TimeframeEnum.Quarter
      ) {
        let dateToStr;
        let timeToStr;

        if (timeSpecWord === common.TimeframeEnum.Week) {
          let tsNextWeek = ts + 7 * 24 * 60 * 60 * 1000;

          let weekTo = this.timeService.getDateTimeStrFromEpochMs({
            ts: tsNextWeek
          });

          dateToStr = weekTo.dateStr;
          timeToStr = weekTo.timeStr;
        }

        if (timeSpecWord === common.TimeframeEnum.Quarter) {
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
      }

      let newFraction =
        timeSpecWord === common.TimeframeEnum.Week ||
        timeSpecWord === common.TimeframeEnum.Quarter
          ? timeRangeFraction
          : timeSpecWord === common.TimeframeEnum.Year
          ? {
              brick: `on ${this.timeService.getYearStr({
                dateValue: dateStr
              })}`,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.TsIsOnYear,
              tsDateYear: Number(dateStr.split('-')[0])
            }
          : timeSpecWord === common.TimeframeEnum.Month
          ? {
              brick: `on ${this.timeService.getMonthStr({
                dateValue: dateStr
              })}`,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.TsIsOnMonth,
              tsDateYear: Number(dateStr.split('-')[0]),
              tsDateMonth: Number(dateStr.split('-')[1].replace(/^0+/, ''))
            }
          : timeSpecWord === common.TimeframeEnum.Date
          ? {
              brick: `on ${this.timeService.getDayStr({
                dateValue: dateStr
              })}`,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.TsIsOnDay,
              tsDateYear: Number(dateStr.split('-')[0]),
              tsDateMonth: Number(dateStr.split('-')[1].replace(/^0+/, '')),
              tsDateDay: Number(dateStr.split('-')[2].replace(/^0+/, ''))
            }
          : timeSpecWord === common.TimeframeEnum.Hour
          ? {
              brick: `on ${this.timeService.getHourStr({
                dateValue: dateStr,
                timeValue: timeStr
              })}`,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.TsIsOnHour,
              tsDateYear: Number(dateStr.split('-')[0]),
              tsDateMonth: Number(dateStr.split('-')[1].replace(/^0+/, '')),
              tsDateDay: Number(dateStr.split('-')[2].replace(/^0+/, '')),
              tsDateHour: Number(timeStr.split(':')[0].replace(/^0+/, ''))
            }
          : timeSpecWord === common.TimeframeEnum.Minute
          ? {
              brick: `on ${this.timeService.getMinuteStr({
                dateValue: dateStr,
                timeValue: timeStr
              })}`,
              operator: common.FractionOperatorEnum.Or,
              type: common.FractionTypeEnum.TsIsOnMinute,
              tsDateYear: Number(dateStr.split('-')[0]),
              tsDateMonth: Number(dateStr.split('-')[1].replace(/^0+/, '')),
              tsDateDay: Number(dateStr.split('-')[2].replace(/^0+/, '')),
              tsDateHour: Number(timeStr.split(':')[0].replace(/^0+/, '')),
              tsDateMinute: Number(timeStr.split(':')[1].replace(/^0+/, ''))
            }
          : undefined;

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

      timeFilter.fractions = [newFraction];

      let newMconfig = mconfig;

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
