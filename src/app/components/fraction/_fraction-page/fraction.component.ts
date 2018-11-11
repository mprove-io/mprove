import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import * as api from 'app/api/_index';

@Component({
  moduleId: module.id,
  selector: 'm-fraction',
  templateUrl: 'fraction.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionComponent {

  modelFieldResultEnum = api.ModelFieldResultEnum;

  @Input() fieldResult: api.ModelFieldResultEnum; // DashboardFieldResultEnum is the same as ModelFieldResultEnum
  @Input() fraction: api.Fraction;
  @Input() isFirst: boolean;
  @Input() hasDuplicates: boolean;
  @Input() fractionIndex: string;

  @Output() fractionUpdate = new EventEmitter();

  constructor() {
  }

  fractionChange(fraction: api.Fraction) {
    // console.log(fraction);
    this.fractionUpdate.emit(
      {
        fraction: fraction,
        fractionIndex: this.fractionIndex
      }
    );
  }
}
