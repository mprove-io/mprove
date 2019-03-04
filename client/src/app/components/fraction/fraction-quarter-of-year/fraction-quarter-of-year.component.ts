import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatSelectChange } from '@angular/material';
import * as api from '@app/api/_index';

@Component({
  moduleId: module.id,
  selector: 'm-fraction-quarter-of-year',
  templateUrl: 'fraction-quarter-of-year.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionQuarterOfYearComponent {
  fractionTypeEnum = api.FractionTypeEnum;
  fractionOperatorEnum = api.FractionOperatorEnum;
  fractionQuarterOfYearValueEnum = api.FractionQuarterOfYearValueEnum;

  @Input() fraction: api.Fraction;
  @Input() isFirst: boolean;

  @Output() fractionChange = new EventEmitter();

  constructor() {}

  typeChange(ev: MatSelectChange) {
    switch (ev.value) {
      case this.fractionTypeEnum.QuarterOfYearIsAnyValue: {
        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          brick: `any`
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.QuarterOfYearIs: {
        let newQuarterOfYearValue =
          this.fraction.quarter_of_year_value ||
          api.FractionQuarterOfYearValueEnum.Q1;

        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          quarter_of_year_value: newQuarterOfYearValue,
          brick: `${newQuarterOfYearValue}`
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.QuarterOfYearIsNull: {
        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.Or,
          brick: `null`
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.QuarterOfYearIsNot: {
        let newQuarterOfYearValue =
          this.fraction.quarter_of_year_value ||
          api.FractionQuarterOfYearValueEnum.Q1;

        this.fraction = {
          type: ev.value,
          operator: api.FractionOperatorEnum.And,
          quarter_of_year_value: newQuarterOfYearValue,
          brick: `not ${newQuarterOfYearValue}`
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.QuarterOfYearIsNotNull: {
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

  quarterOfYearValueChange(ev: MatSelectChange) {
    if (this.fraction.type === api.FractionTypeEnum.QuarterOfYearIs) {
      this.fraction = {
        type: api.FractionTypeEnum.QuarterOfYearIs,
        operator: api.FractionOperatorEnum.Or,
        quarter_of_year_value: ev.value,
        brick: `${ev.value}`
      };
    } else if (this.fraction.type === api.FractionTypeEnum.QuarterOfYearIsNot) {
      this.fraction = {
        type: api.FractionTypeEnum.QuarterOfYearIsNot,
        operator: api.FractionOperatorEnum.And,
        quarter_of_year_value: ev.value,
        brick: `not ${ev.value}`
      };
    }

    this.emitFractionChange();
  }

  emitFractionChange() {
    this.fractionChange.emit(this.fraction);
  }
}
