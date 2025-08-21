import { Component, EventEmitter, Input, Output } from '@angular/core';

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

  @Input() suggestModelDimension: string;
  @Input() structId: string;
  @Input() modelContent: any;

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
