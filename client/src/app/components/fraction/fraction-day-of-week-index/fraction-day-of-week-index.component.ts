import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import * as api from '@app/api/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-fraction-day-of-week-index',
  templateUrl: 'fraction-day-of-week-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionDayOfWeekIndexComponent implements OnInit {
  fractionTypeEnum = api.FractionTypeEnum;
  fractionOperatorEnum = api.FractionOperatorEnum;

  @Input() fraction: api.Fraction;
  @Input() isFirst: boolean;

  @Output() fractionChange = new EventEmitter();

  dayOfWeekIndexValuesForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildDayOfWeekIndexValuesForm();
  }

  getDayOfWeekIndexBrick(fractionType: api.FractionTypeEnum, value: string) {
    let newBrick =
      fractionType === api.FractionTypeEnum.DayOfWeekIndexIsEqualTo
        ? value
        : fractionType === api.FractionTypeEnum.DayOfWeekIndexIsNotEqualTo
        ? `not ${value}`
        : '';

    return newBrick;
  }

  buildDayOfWeekIndexValuesForm() {
    this.dayOfWeekIndexValuesForm = this.fb.group({
      dayOfWeekIndexValues: [
        this.fraction.day_of_week_index_values,
        Validators.compose([
          Validators.required,
          services.ValidationService.dayOfWeekIndexValuesValidator,
          Validators.maxLength(255)
        ])
      ]
    });
  }

  typeChange(ev: MatSelectChange) {
    switch (ev.value) {
      case this.fractionTypeEnum.DayOfWeekIndexIsAnyValue: {
        this.fraction = {
          brick: `any`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsEqualTo: {
        this.fraction = {
          brick: `${this.fraction.day_of_week_index_values}`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          day_of_week_index_values: this.fraction.day_of_week_index_values
        };

        if (this.dayOfWeekIndexValuesForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsNull: {
        this.fraction = {
          brick: `null`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsNotEqualTo: {
        this.fraction = {
          brick: `not ${this.fraction.day_of_week_index_values}`,
          operator: api.FractionOperatorEnum.And,
          type: ev.value,
          day_of_week_index_values: this.fraction.day_of_week_index_values
        };

        if (this.dayOfWeekIndexValuesForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsNotNull: {
        this.fraction = {
          brick: `not null`,
          operator: api.FractionOperatorEnum.And,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      default: {
      }
    }
  }

  dayOfWeekIndexValuesBlur(dayOfWeekIndexValues: FormControl) {
    if (dayOfWeekIndexValues.value !== this.fraction.day_of_week_index_values) {
      let newBrick = this.getDayOfWeekIndexBrick(
        this.fraction.type,
        dayOfWeekIndexValues.value
      );

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        day_of_week_index_values: dayOfWeekIndexValues.value
      };

      if (this.dayOfWeekIndexValuesForm.valid) {
        this.emitFractionChange();
      }
    }
  }

  emitFractionChange() {
    this.fractionChange.emit(this.fraction);
  }
}
