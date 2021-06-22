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

  // fractionUpdate(eventFractionUpdate: EventFractionUpdate) {
  //   this.fractionUpdate.emit(eventFractionUpdate);
  // }
}
