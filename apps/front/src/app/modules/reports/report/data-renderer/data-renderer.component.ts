import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DataRow } from '~front/app/interfaces/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ChartService } from '~front/app/services/chart.service';
import { DataService } from '~front/app/services/data.service';
import { TimeService } from '~front/app/services/time.service';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
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

    let struct = this.structQuery.getValue();

    this.formattedValue =
      this.isError === false && common.isDefined(params.value)
        ? this.dataService.formatValue({
            value: params.value,
            formatNumber: params.data.formatNumber,
            fieldResult: common.FieldResultEnum.Number,
            currencyPrefix: params.data.currencyPrefix,
            currencySuffix: params.data.currencySuffix,
            thousandsSeparator: struct.thousandsSeparator
          })
        : this.isError === true
          ? rowDataRecord.error
          : undefined;
  }

  clickCellData(event: MouseEvent) {
    event.stopPropagation();

    if (
      common.isDefined(this.params.data.mconfig) &&
      this.params.data.rowType === common.RowTypeEnum.Metric
    ) {
      let isStore =
        this.params.data.mconfig.modelType === common.ModelTypeEnum.Store;
      // let isStore = this.params.data.mconfig.isStoreModel;

      // console.log('isStore');
      // console.log(isStore);

      let rowDataRecord = this.params.data.records.find(
        x => x.key * 1000 === Number(this.params.colDef.field)
      );

      // console.log(rowDataRecord.key);

      let tsMs = rowDataRecord.key * 1000;

      let metric = this.structQuery
        .getValue()
        .metrics.find(y => y.metricId === this.params.data.metricId);

      let timeSpec = this.reportQuery.getValue().timeSpec;

      let timeRangeFraction;

      let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

      let { date, dateStr, timeStr, dateUtcMs } =
        this.timeService.getDateTimeStrFromEpochMs({
          ts: tsMs
        });

      let isDateRangeIncludesRightSide =
        this.params.data.mconfig.dateRangeIncludesRightSide;

      let cellMetricsStartDateMs = dateUtcMs;
      let cellMetricsEndDateMs;

      let dateToStr;
      let timeToStr;

      if (timeSpecWord === common.TimeframeEnum.Year) {
        let nextYear = date.getUTCFullYear() + 1;
        let nextYearDate = new Date(nextYear, 0, 1, 0, 0, 0, 0);

        cellMetricsEndDateMs =
          nextYearDate.getTime() - nextYearDate.getTimezoneOffset() * 60 * 1000;

        let yearTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: cellMetricsEndDateMs
        });

        dateToStr = yearTo.dateStr;
        timeToStr = yearTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Quarter) {
        let qMonth = date.getUTCMonth(); // Months are 0-11

        let nextQuarterMonth = (Math.floor(qMonth / 3) * 3 + 3) % 12;

        let yearIncrement = qMonth >= 9 ? 1 : 0; // If current month is Oct-Dec, increment year

        let nextQuarterYear = date.getUTCFullYear() + yearIncrement;

        let nextQuarterDate = new Date(
          nextQuarterYear,
          nextQuarterMonth,
          1,
          0,
          0,
          0,
          0
        );

        cellMetricsEndDateMs =
          nextQuarterDate.getTime() -
          nextQuarterDate.getTimezoneOffset() * 60 * 1000;

        let quarterTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: cellMetricsEndDateMs
        });

        dateToStr = quarterTo.dateStr;
        timeToStr = quarterTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Month) {
        let month = date.getUTCMonth(); // Months are zero-based (0-11)

        let nextMonth = month === 11 ? 0 : month + 1;

        let yearTo =
          nextMonth === 0 ? date.getUTCFullYear() + 1 : date.getUTCFullYear();

        let nextMonthDate = new Date(yearTo, nextMonth, 1, 0, 0, 0, 0);

        cellMetricsEndDateMs =
          nextMonthDate.getTime() -
          nextMonthDate.getTimezoneOffset() * 60 * 1000;

        let monthTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: cellMetricsEndDateMs
        });

        dateToStr = monthTo.dateStr;
        timeToStr = monthTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Week) {
        cellMetricsEndDateMs = cellMetricsStartDateMs + 7 * 24 * 60 * 60 * 1000;

        let weekTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: cellMetricsEndDateMs
        });

        dateToStr = weekTo.dateStr;
        timeToStr = weekTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Date) {
        cellMetricsEndDateMs = cellMetricsStartDateMs + 24 * 60 * 60 * 1000;

        let dayTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: cellMetricsEndDateMs
        });

        dateToStr = dayTo.dateStr;
        timeToStr = dayTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Hour) {
        let tsNextHour = tsMs + 60 * 60 * 1000;

        let hourTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextHour
        });

        dateToStr = hourTo.dateStr;
        timeToStr = hourTo.timeStr;
      } else if (timeSpecWord === common.TimeframeEnum.Minute) {
        let tsNextMinute = tsMs + 60 * 1000;

        let minuteTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextMinute
        });

        dateToStr = minuteTo.dateStr;
        timeToStr = minuteTo.timeStr;
      } else {
        let tsNextMinute = tsMs + 60 * 1000;

        let minuteTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextMinute
        });

        dateToStr = minuteTo.dateStr;
        timeToStr = minuteTo.timeStr;
      }

      let minuteStr = this.timeService.getMinuteStr({
        dateValue: dateStr,
        timeValue: timeStr,
        dateSeparator:
          metric.modelType === common.ModelTypeEnum.Malloy ? '-' : '/'
      });

      let minuteToStr = this.timeService.getMinuteStr({
        dateValue: dateToStr,
        timeValue: timeToStr,
        dateSeparator:
          metric.modelType === common.ModelTypeEnum.Malloy ? '-' : '/'
      });

      timeRangeFraction = {
        brick: `on ${minuteStr} to ${minuteToStr}`,
        operator: common.FractionOperatorEnum.Or,
        type: common.FractionTypeEnum.TsIsBetween,
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

      let newMconfigId = common.makeId();
      let newQueryId = common.makeId();

      let mconfigCopy = common.makeCopy(this.params.data.mconfig);

      let newMconfig = Object.assign(mconfigCopy, <common.MconfigX>{
        mconfigId: newMconfigId,
        queryId: newQueryId,
        temp: true,
        serverTs: 1
      });

      newMconfig.chart.type = common.ChartTypeEnum.Table;

      let newFilters = [...newMconfig.filters];

      if (isStore === false) {
        let newFraction = timeRangeFraction;

        let newFilter: common.Filter = {
          fieldId: `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Time}`,
          fractions: [newFraction]
        };

        newFilters.push(newFilter);
      }

      newMconfig.filters = newFilters.sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      );

      if (
        common.isDefined(cellMetricsStartDateMs) &&
        common.isDefined(cellMetricsEndDateMs) &&
        isDateRangeIncludesRightSide === true &&
        cellMetricsEndDateMs - cellMetricsStartDateMs >= 24 * 60 * 60 * 1000
      ) {
        cellMetricsEndDateMs = cellMetricsEndDateMs - 24 * 60 * 60 * 1000;
      }

      if (common.isUndefined(cellMetricsEndDateMs)) {
        cellMetricsEndDateMs = undefined;
      }

      // console.log('cellMetricsStartDateMs');
      // console.log(cellMetricsStartDateMs);
      // console.log('cellMetricsEndDateMs');
      // console.log(cellMetricsEndDateMs);

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: false,
        chartId: undefined,
        cellMetricsStartDateMs: cellMetricsStartDateMs,
        cellMetricsEndDateMs: cellMetricsEndDateMs
      });

      // this.mconfigService.navCreateTempMconfigAndQuery({
      //   newMconfig: newMconfig,
      //   cellMetricsStartDateMs: cellMetricsStartDateMs,
      //   cellMetricsEndDateMs: cellMetricsEndDateMs
      // });
    }
  }

  constructor(
    private dataService: DataService,
    private chartService: ChartService,
    private structQuery: StructQuery,
    private reportQuery: ReportQuery,
    private timeService: TimeService
  ) {}
}
