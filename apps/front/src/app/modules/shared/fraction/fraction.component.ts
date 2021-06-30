import { Component, EventEmitter, Input, Output } from '@angular/core';
import { common } from '~front/barrels/common';
import { EventFractionUpdate } from '../../model/model-filters/model-filters.component';

export class FractionTypeItem {
  label: string;
  value: common.FractionTypeEnum;
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

@Component({
  selector: 'm-fraction',
  templateUrl: './fraction.component.html'
})
export class FractionComponent {
  fractionOperatorEnum = common.FractionOperatorEnum;

  fieldResultEnum = common.FieldResultEnum;

  @Input() fieldResult: common.FieldResultEnum;

  @Input() fraction: common.Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  constructor() {}
}
