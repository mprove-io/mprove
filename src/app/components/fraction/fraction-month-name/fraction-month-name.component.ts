import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import * as api from 'app/api/_index';

@Component({
  moduleId: module.id,
  selector: 'm-fraction-month-name',
  templateUrl: 'fraction-month-name.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionMonthNameComponent {

  fractionTypeEnum = api.FractionTypeEnum;
  fractionOperatorEnum = api.FractionOperatorEnum;
  fractionMonthNameValueEnum = api.FractionMonthNameValueEnum;

  @Input() fraction: api.Fraction;
  @Input() isFirst: boolean;

  @Output() fractionChange = new EventEmitter();

  constructor() {
  }

  typeChange(ev: MatSelectChange) {
    switch (ev.value) {

      case (this.fractionTypeEnum.MonthNameIsAnyValue): {
        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          brick: `any`,
        };

        this.emitFractionChange();
        break;
      }

      case (this.fractionTypeEnum.MonthNameIs): {
        let newMonthNameValue = this.fraction.month_name_value || api.FractionMonthNameValueEnum.January;

        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          month_name_value: newMonthNameValue,
          brick: `${newMonthNameValue}`,
        };

        this.emitFractionChange();
        break;
      }

      case (this.fractionTypeEnum.MonthNameIsNull): {
        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          brick: `null`,
        };

        this.emitFractionChange();
        break;
      }

      case (this.fractionTypeEnum.MonthNameIsNot): {
        let newMonthNameValue = this.fraction.month_name_value || api.FractionMonthNameValueEnum.January;

        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.And,
          month_name_value: newMonthNameValue,
          brick: `not ${newMonthNameValue}`,
        };

        this.emitFractionChange();
        break;
      }

      case (this.fractionTypeEnum.MonthNameIsNotNull): {
        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.And,
          brick: `not null`,
        };

        this.emitFractionChange();
        break;
      }

      default: {
      }
    }
  }

  monthNameValueChange(ev: MatSelectChange) {
    if (this.fraction.type === api.FractionTypeEnum.MonthNameIs) {

      this.fraction = {
        type: api.FractionTypeEnum.MonthNameIs,
        operator: api.FractionOperatorEnum.Or,
        month_name_value: ev.value,
        brick: `${ev.value}`,
      };

    } else if (this.fraction.type === api.FractionTypeEnum.MonthNameIsNot) {
      this.fraction = {
        type: api.FractionTypeEnum.MonthNameIsNot,
        operator: api.FractionOperatorEnum.And,
        month_name_value: ev.value,
        brick: `not ${ev.value}`,
      };
    }

    this.emitFractionChange();
  }

  emitFractionChange() {
    this.fractionChange.emit(this.fraction);
  }
}
