import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TemporalUnit } from '@malloydata/malloy-filter';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

export class FractionTypeItem {
  label: string;
  value: common.FractionTypeEnum;
  operator: common.FractionOperatorEnum;
}

export class FractionNumberBetweenOptionItem {
  label: string;
  value: common.FractionNumberBetweenOptionEnum;
}

export class FractionYesnoValueItem {
  label: string;
  value: common.FractionYesnoValueEnum;
}

export class FractionMonthNameValueItem {
  label: string;
  value: common.FractionMonthNameValueEnum;
}

export class FractionDayOfWeekValueItem {
  label: string;
  value: common.FractionDayOfWeekValueEnum;
}

export class FractionQuarterOfYearValueItem {
  label: string;
  value: common.FractionQuarterOfYearValueEnum;
}

export class FractionTsRelativeUnitItem {
  label: string;
  value: common.FractionTsRelativeUnitEnum;
}

export class FractionTsRelativeCompleteOptionItem {
  label: string;
  value: common.FractionTsRelativeCompleteOptionEnum;
}

export class FractionTsRelativeWhenOptionItem {
  label: string;
  value: common.FractionTsRelativeWhenOptionEnum;
}

export class FractionTsForOptionItem {
  label: string;
  value: common.FractionTsForOptionEnum;
}

export class FractionTsUnitItem {
  label: string;
  value: TemporalUnit;
}

export class FractionTsDayOfWeekLcItem {
  label: string;
  value: common.FractionDayOfWeekLcEnum;
}

export class FractionTsForUnitItem {
  label: string;
  value: common.FractionTsForUnitEnum;
}

export class FractionTsLastUnitItem {
  label: string;
  value: common.FractionTsLastUnitEnum;
}

export class FractionTsNextUnitItem {
  label: string;
  value: common.FractionTsNextUnitEnum;
}

export class FractionTsLastCompleteOptionItem {
  label: string;
  value: common.FractionTsLastCompleteOptionEnum;
}

export class FractionTsMomentTypesItem {
  label: string;
  value: common.FractionTsMomentTypeEnum;
}

@Component({
  standalone: false,
  selector: 'm-fraction',
  templateUrl: './fraction.component.html'
})
export class FractionComponent {
  fractionOperatorEnum = common.FractionOperatorEnum;
  fieldResultEnum = common.FieldResultEnum;

  fractionTypeStoreFraction = common.FractionTypeEnum.StoreFraction;

  controlClassSelector = common.ControlClassEnum.Selector;
  controlClassInput = common.ControlClassEnum.Input;
  controlClassSwitch = common.ControlClassEnum.Switch;
  controlClassDatePicker = common.ControlClassEnum.DatePicker;

  @Input() suggestModelDimension: string;
  @Input() structId: string;
  @Input() modelContent: any;

  @Input() metricsStartDateYYYYMMDD: string;
  @Input() metricsEndDateYYYYMMDD: string;

  @Input() isMetricsPage: boolean;
  @Input() isDisabled: boolean = false;
  @Input() fieldResult: common.FieldResultEnum | string;

  @Input() fraction: common.Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  constructor() {}
}
