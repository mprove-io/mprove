import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventFractionUpdate } from '~front/app/modules/model/model-filters/model-filters.component';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';
import { FractionTypeItem } from '../fraction.component';

@Component({
  selector: 'm-fraction-day-of-week-index',
  templateUrl: 'fraction-day-of-week-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionDayOfWeekIndexComponent implements OnInit {
  defaultDayOfWeekIndexValues = '1, 2, 3';

  fractionTypeEnum = common.FractionTypeEnum;

  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionTypeForm: FormGroup;

  dayOfWeekIndexValuesForm: FormGroup;

  fractionDayOfWeekIndexTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.DayOfWeekIndexIsAnyValue
    },
    {
      label: 'is equal to',
      value: common.FractionTypeEnum.DayOfWeekIndexIsEqualTo
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.DayOfWeekIndexIsNull
    },
    {
      label: 'is not equal to',
      value: common.FractionTypeEnum.DayOfWeekIndexIsNotEqualTo
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.DayOfWeekIndexIsNotNull
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildFractionTypeForm();
    this.buildDayOfWeekIndexValuesForm();
  }

  buildFractionTypeForm() {
    this.fractionTypeForm = this.fb.group({
      fractionType: [this.fraction.type]
    });
  }

  buildDayOfWeekIndexValuesForm() {
    this.dayOfWeekIndexValuesForm = this.fb.group({
      dayOfWeekIndexValues: [
        this.fraction.dayOfWeekIndexValues,
        Validators.compose([
          Validators.required,
          ValidationService.dayOfWeekIndexValuesValidator,
          Validators.maxLength(255)
        ])
      ]
    });
  }

  updateControlDayOfWeekIndexValuesFromFraction() {
    this.dayOfWeekIndexValuesForm.controls['dayOfWeekIndexValues'].setValue(
      this.fraction.dayOfWeekIndexValues
    );
  }

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    switch (fractionType) {
      case this.fractionTypeEnum.DayOfWeekIndexIsAnyValue: {
        this.fraction = {
          brick: `any`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsEqualTo: {
        let dayOfWeekIndexValues = this.defaultDayOfWeekIndexValues;

        this.fraction = {
          brick: `${dayOfWeekIndexValues}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          dayOfWeekIndexValues: dayOfWeekIndexValues
        };

        this.updateControlDayOfWeekIndexValuesFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsNull: {
        this.fraction = {
          brick: `null`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      //
      case this.fractionTypeEnum.DayOfWeekIndexIsNotEqualTo: {
        let dayOfWeekIndexValues = this.defaultDayOfWeekIndexValues;

        this.fraction = {
          brick: `not ${dayOfWeekIndexValues}`,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          dayOfWeekIndexValues: dayOfWeekIndexValues
        };

        this.updateControlDayOfWeekIndexValuesFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsNotNull: {
        this.fraction = {
          brick: `not null`,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      default: {
      }
    }
  }

  getDayOfWeekIndexBrick(fractionType: common.FractionTypeEnum, value: string) {
    let newBrick =
      fractionType === common.FractionTypeEnum.DayOfWeekIndexIsEqualTo
        ? value
        : fractionType === common.FractionTypeEnum.DayOfWeekIndexIsNotEqualTo
        ? `not ${value}`
        : '';

    return newBrick;
  }

  dayOfWeekIndexValuesBlur() {
    let value = this.dayOfWeekIndexValuesForm.controls['dayOfWeekIndexValues']
      .value;

    if (value !== this.fraction.dayOfWeekIndexValues) {
      let newBrick = this.getDayOfWeekIndexBrick(this.fraction.type, value);

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        dayOfWeekIndexValues: value
      };

      if (this.dayOfWeekIndexValuesForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }
}
