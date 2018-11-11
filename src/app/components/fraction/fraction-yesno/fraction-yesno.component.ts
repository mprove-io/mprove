import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import * as api from 'src/app/api/_index';

@Component({
  moduleId: module.id,
  selector: 'm-fraction-yesno',
  templateUrl: 'fraction-yesno.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionYesnoComponent {

  fractionTypeEnum = api.FractionTypeEnum;
  fractionOperatorEnum = api.FractionOperatorEnum;
  fractionYesnoValueEnum = api.FractionYesnoValueEnum;

  @Input() fraction: api.Fraction;
  @Input() isFirst: boolean;

  @Output() fractionChange = new EventEmitter();

  constructor() {
  }

  typeChange(ev: MatSelectChange) {
    switch (ev.value) {

      case (this.fractionTypeEnum.YesnoIsAnyValue): {
        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          brick: `any`,
        };

        this.emitFractionChange();
        break;
      }

      case (this.fractionTypeEnum.YesnoIs): {
        let newYesnoValue = this.fraction.yesno_value || api.FractionYesnoValueEnum.Yes;

        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          yesno_value: newYesnoValue,
          brick: `${newYesnoValue}`,
        };

        this.emitFractionChange();
        break;
      }

      default: {
      }
    }
  }

  yesnoChange(ev: MatSelectChange) {
    this.fraction = {
      type: api.FractionTypeEnum.YesnoIs,
      operator: api.FractionOperatorEnum.Or,
      yesno_value: ev.value,
      brick: `${ev.value}`,
    };

    this.emitFractionChange();
  }

  emitFractionChange() {
    this.fractionChange.emit(this.fraction);
  }
}
