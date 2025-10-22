import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlClassEnum } from '~common/enums/control-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { FractionDayOfWeekValueEnum } from '~common/enums/fraction/fraction-day-of-week-value.enum';
import { FractionMonthNameValueEnum } from '~common/enums/fraction/fraction-month-name-value.enum';
import { FractionNumberBetweenOptionEnum } from '~common/enums/fraction/fraction-number-between-option.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionQuarterOfYearValueEnum } from '~common/enums/fraction/fraction-quarter-of-year-value.enum';
import { FractionTsLastCompleteOptionEnum } from '~common/enums/fraction/fraction-ts-last-complete-option.enum';
import { FractionTsMixUnitEnum } from '~common/enums/fraction/fraction-ts-mix-unit.enum';
import { FractionTsMomentTypeEnum } from '~common/enums/fraction/fraction-ts-moment-type.enum';
import { FractionTsUnitEnum } from '~common/enums/fraction/fraction-ts-unit.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { FractionYesnoValueEnum } from '~common/enums/fraction/fraction-yesno-value.enum';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';

export class FractionTypeItem {
  label: string;
  value: FractionTypeEnum;
  operator: FractionOperatorEnum;
  timeframeLevel?: number;
}

export class FractionTsMomentTypesItem {
  label: string;
  value: FractionTsMomentTypeEnum;
}

export class FractionTsMixUnitItem {
  label: string;
  value: FractionTsMixUnitEnum;
  timeframeLevel: number;
}

export class FractionTsUnitItem {
  label: string;
  value: FractionTsUnitEnum;
  timeframeLevel: number;
}

export class FractionDayOfWeekValueItem {
  label: string;
  value: FractionDayOfWeekValueEnum;
}

export class FractionTsLastCompleteOptionItem {
  label: string;
  value: FractionTsLastCompleteOptionEnum;
}

export class FractionQuarterOfYearValueItem {
  label: string;
  value: FractionQuarterOfYearValueEnum;
}

export class FractionMonthNameValueItem {
  label: string;
  value: FractionMonthNameValueEnum;
}

export class FractionYesnoValueItem {
  label: string;
  value: FractionYesnoValueEnum;
}

export class FractionNumberBetweenOptionItem {
  label: string;
  value: FractionNumberBetweenOptionEnum;
}

@Component({
  standalone: false,
  selector: 'm-fraction',
  templateUrl: './fraction.component.html'
})
export class FractionComponent {
  fractionOperatorEnum = FractionOperatorEnum;
  fieldResultEnum = FieldResultEnum;

  fractionTypeStoreFraction = FractionTypeEnum.StoreFraction;

  controlClassSelector = ControlClassEnum.Selector;
  controlClassInput = ControlClassEnum.Input;
  controlClassSwitch = ControlClassEnum.Switch;
  controlClassDatePicker = ControlClassEnum.DatePicker;

  @Input() storeContent: FileStore;

  @Input() suggestModelDimension: string;
  @Input() structId: string;
  @Input() chartId: string;
  @Input() dashboardId: string;
  @Input() reportId: string;
  @Input() rowId: string;

  @Input() metricsStartDateYYYYMMDD: string;
  @Input() metricsEndDateYYYYMMDD: string;

  @Input() isMetricsPage: boolean;
  @Input() isDisabled: boolean = false;
  @Input() fieldResult: FieldResultEnum | string;
  @Input() fieldTimeframe: string;

  @Input() fraction: Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  constructor() {}
}
