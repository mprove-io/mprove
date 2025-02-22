import { Component, EventEmitter, Input, Output } from '@angular/core';
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

export class FractionTsForUnitItem {
  label: string;
  value: common.FractionTsForUnitEnum;
}

export class FractionTsLastUnitItem {
  label: string;
  value: common.FractionTsLastUnitEnum;
}

export class FractionTsLastCompleteOptionItem {
  label: string;
  value: common.FractionTsLastCompleteOptionEnum;
}

@Component({
  selector: 'm-fraction',
  templateUrl: './fraction.component.html'
})
export class FractionComponent {
  fractionOperatorEnum = common.FractionOperatorEnum;

  fieldResultEnum = common.FieldResultEnum;

  fractionTypeStoreFraction = common.FractionTypeEnum.StoreFraction;
  controlClassSelector = common.ControlClassEnum.Selector;
  controlClassInput = common.ControlClassEnum.Input;

  @Input() suggestModelDimension: string;
  @Input() structId: string;
  @Input() modelContent: any;

  @Input() isDisabled: boolean;
  @Input() fieldResult: common.FieldResultEnum;

  @Input() fraction: common.Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  constructor() {}
}
