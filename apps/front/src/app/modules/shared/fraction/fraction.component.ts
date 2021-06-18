import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FractionExtended } from '~front/app/queries/mconfig.query';
import { common } from '~front/barrels/common';
import { EventFractionUpdate } from '../../model/model-filters/model-filters.component';

export class FractionTypeItem {
  label: string;
  value: common.FractionTypeEnum;
}

@Component({
  selector: 'm-fraction',
  templateUrl: './fraction.component.html'
})
export class FractionComponent {
  fieldResultEnum = common.FieldResultEnum;

  @Input() fieldResult: common.FieldResultEnum;

  @Input() fraction: FractionExtended;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  constructor() {}

  // fractionUpdate(eventFractionUpdate: EventFractionUpdate) {
  //   this.fractionUpdate.emit(eventFractionUpdate);
  // }
}
