import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatSelectChange } from '@angular/material';
import * as api from 'app/api/_index';

@Component({
  moduleId: module.id,
  selector: 'm-fraction-day-of-week',
  templateUrl: 'fraction-day-of-week.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionDayOfWeekComponent {
  fractionTypeEnum = api.FractionTypeEnum;
  fractionOperatorEnum = api.FractionOperatorEnum;
  fractionDayOfWeekValueEnum = api.FractionDayOfWeekValueEnum;

  @Input() fraction: api.Fraction;
  @Input() isFirst: boolean;

  @Output() fractionChange = new EventEmitter();

  constructor() {}

  typeChange(ev: MatSelectChange) {
    switch (ev.value) {
      case this.fractionTypeEnum.DayOfWeekIsAnyValue: {
        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          brick: `any`
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIs: {
        let newDayOfWeekValue =
          this.fraction.day_of_week_value ||
          api.FractionDayOfWeekValueEnum.Monday;

        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          day_of_week_value: newDayOfWeekValue,
          brick: `${newDayOfWeekValue}`
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIsNull: {
        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          brick: `null`
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIsNot: {
        let newDayOfWeekValue =
          this.fraction.day_of_week_value ||
          api.FractionDayOfWeekValueEnum.Monday;

        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.And,
          day_of_week_value: newDayOfWeekValue,
          brick: `not ${newDayOfWeekValue}`
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIsNotNull: {
        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.And,
          brick: `not null`
        };

        this.emitFractionChange();
        break;
      }

      default: {
      }
    }
  }

  dayOfWeekValueChange(ev: MatSelectChange) {
    if (this.fraction.type === api.FractionTypeEnum.DayOfWeekIs) {
      this.fraction = {
        type: api.FractionTypeEnum.DayOfWeekIs,
        operator: api.FractionOperatorEnum.Or,
        day_of_week_value: ev.value,
        brick: `${ev.value}`
      };
    } else if (this.fraction.type === api.FractionTypeEnum.DayOfWeekIsNot) {
      this.fraction = {
        type: api.FractionTypeEnum.DayOfWeekIsNot,
        operator: api.FractionOperatorEnum.And,
        day_of_week_value: ev.value,
        brick: `not ${ev.value}`
      };
    }

    this.emitFractionChange();
  }

  emitFractionChange() {
    this.fractionChange.emit(this.fraction);
  }
}
