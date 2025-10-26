import { Component } from '@angular/core';
import { Moment } from '@malloydata/malloy-filter';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTsMixUnitEnum } from '~common/enums/fraction/fraction-ts-mix-unit.enum';
import { FractionTsMomentTypeEnum } from '~common/enums/fraction/fraction-ts-moment-type.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { TimeframeEnum } from '~common/enums/timeframe.enum';
import { getTimeSpecWord } from '~common/functions/get-timespec-word';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Filter } from '~common/interfaces/blockml/filter';
import { DataRow } from '~common/interfaces/front/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ChartService } from '~front/app/services/chart.service';
import { DataService } from '~front/app/services/data.service';
import { TimeService } from '~front/app/services/time.service';

@Component({
  standalone: false,
  selector: 'm-data-renderer',
  templateUrl: './data-renderer.component.html'
})
export class DataRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  rowTypeMetric = RowTypeEnum.Metric;
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

    this.isError = isDefined(rowDataRecord?.error);

    this.formattedValue =
      this.isError === false && isDefined(params.value)
        ? this.dataService.formatValue({
            value: params.value,
            modelType: params.data.mconfig?.modelType,
            field: params.data.mconfig?.fields[1],
            fieldResult: FieldResultEnum.Number,
            rowFormatNumber: params.data.formatNumber,
            rowCurrencyPrefix: params.data.currencyPrefix,
            rowCurrencySuffix: params.data.currencySuffix
          })
        : this.isError === true
          ? rowDataRecord.error
          : undefined;
  }

  clickCellData(event: MouseEvent) {
    event.stopPropagation();

    if (
      isDefined(this.params.data.mconfig) &&
      this.params.data.rowType === RowTypeEnum.Metric
    ) {
      let isStore = this.params.data.mconfig.modelType === ModelTypeEnum.Store;

      let rowDataRecord = this.params.data.records.find(
        x => x.key * 1000 === Number(this.params.colDef.field)
      );

      let tsMs = rowDataRecord.key * 1000;

      let metric = this.structQuery
        .getValue()
        .metrics.find(y => y.metricId === this.params.data.metricId);

      let timeSpec = this.reportQuery.getValue().timeSpec;

      let timeRangeFraction;

      let timeSpecWord = getTimeSpecWord({ timeSpec: timeSpec });

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

      if (timeSpecWord === TimeframeEnum.Year) {
        let nextYear = date.getUTCFullYear() + 1;
        let nextYearDate = new Date(nextYear, 0, 1, 0, 0, 0, 0);

        cellMetricsEndDateMs =
          nextYearDate.getTime() - nextYearDate.getTimezoneOffset() * 60 * 1000;

        let yearTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: cellMetricsEndDateMs
        });

        dateToStr = yearTo.dateStr;
        timeToStr = yearTo.timeStr;
      } else if (timeSpecWord === TimeframeEnum.Quarter) {
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
      } else if (timeSpecWord === TimeframeEnum.Month) {
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
      } else if (timeSpecWord === TimeframeEnum.Week) {
        cellMetricsEndDateMs = cellMetricsStartDateMs + 7 * 24 * 60 * 60 * 1000;

        let weekTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: cellMetricsEndDateMs
        });

        dateToStr = weekTo.dateStr;
        timeToStr = weekTo.timeStr;
      } else if (timeSpecWord === TimeframeEnum.Date) {
        cellMetricsEndDateMs = cellMetricsStartDateMs + 24 * 60 * 60 * 1000;

        let dayTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: cellMetricsEndDateMs
        });

        dateToStr = dayTo.dateStr;
        timeToStr = dayTo.timeStr;
      } else if (timeSpecWord === TimeframeEnum.Hour) {
        let tsNextHour = tsMs + 60 * 60 * 1000;

        let hourTo = this.timeService.getDateTimeStrFromEpochMs({
          ts: tsNextHour
        });

        dateToStr = hourTo.dateStr;
        timeToStr = hourTo.timeStr;
      } else if (timeSpecWord === TimeframeEnum.Minute) {
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
        dateSeparator: metric.modelType === ModelTypeEnum.Malloy ? '-' : '/'
      });

      let minuteToStr = this.timeService.getMinuteStr({
        dateValue: dateToStr,
        timeValue: timeToStr,
        dateSeparator: metric.modelType === ModelTypeEnum.Malloy ? '-' : '/'
      });

      let fromMoment: Moment = {
        moment: 'literal',
        literal: minuteStr,
        units: FractionTsMixUnitEnum.Minute
      };

      let toMoment: Moment = {
        moment: 'literal',
        literal: minuteToStr,
        units: FractionTsMixUnitEnum.Minute
      };

      timeRangeFraction = {
        brick: `f\`${minuteStr} to ${minuteToStr}\``,
        parentBrick: `f\`${minuteStr} to ${minuteToStr}\``,
        operator: FractionOperatorEnum.Or,
        type: FractionTypeEnum.TsIsBetween,
        tsFromMomentType: FractionTsMomentTypeEnum.Literal,
        tsToMomentType: FractionTsMomentTypeEnum.Literal,
        tsFromMoment: fromMoment,
        tsFromMomentUnit: FractionTsMixUnitEnum.Minute,
        tsToMoment: toMoment,
        tsToMomentUnit: FractionTsMixUnitEnum.Minute,
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

      let newMconfigId = makeId();
      let newQueryId = makeId();

      let mconfigCopy = makeCopy(this.params.data.mconfig);

      let newMconfig = Object.assign(mconfigCopy, <MconfigX>{
        mconfigId: newMconfigId,
        queryId: newQueryId,
        serverTs: 1
      });

      newMconfig.chart.type = ChartTypeEnum.Table;

      let newFilters = [...newMconfig.filters];

      if (isStore === false) {
        let newFraction = timeRangeFraction;

        let newFilter: Filter = {
          fieldId: `${metric.timeFieldId}_ts`,
          fractions: [newFraction]
        };

        newFilters.push(newFilter);
      }

      newMconfig.filters = newFilters.sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      );

      if (
        isDefined(cellMetricsStartDateMs) &&
        isDefined(cellMetricsEndDateMs) &&
        isDateRangeIncludesRightSide === true &&
        cellMetricsEndDateMs - cellMetricsStartDateMs >= 24 * 60 * 60 * 1000
      ) {
        cellMetricsEndDateMs = cellMetricsEndDateMs - 24 * 60 * 60 * 1000;
      }

      if (isUndefined(cellMetricsEndDateMs)) {
        cellMetricsEndDateMs = undefined;
      }

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: false,
        chartId: undefined,
        cellMetricsStartDateMs: cellMetricsStartDateMs,
        cellMetricsEndDateMs: cellMetricsEndDateMs
      });
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
