import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import {
  FractionDayOfWeekValueItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  selector: 'm-fraction-day-of-week',
  templateUrl: 'fraction-day-of-week.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionDayOfWeekComponent implements OnInit {
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  fractionTypeForm: FormGroup;
  fractionForm: FormGroup;

  fractionDayOfWeekTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.DayOfWeekIsAnyValue
    },
    {
      label: 'is',
      value: common.FractionTypeEnum.DayOfWeekIs
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.DayOfWeekIsNull
    },
    {
      label: 'is not',
      value: common.FractionTypeEnum.DayOfWeekIsNot
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.DayOfWeekIsNotNull
    }
  ];

  fractionDayOfWeekValuesList: FractionDayOfWeekValueItem[] = [
    {
      label: 'Monday',
      value: common.FractionDayOfWeekValueEnum.Monday
    },
    {
      label: 'Tuesday',
      value: common.FractionDayOfWeekValueEnum.Tuesday
    },
    {
      label: 'Wednesday',
      value: common.FractionDayOfWeekValueEnum.Wednesday
    },
    {
      label: 'Thursday',
      value: common.FractionDayOfWeekValueEnum.Thursday
    },
    {
      label: 'Friday',
      value: common.FractionDayOfWeekValueEnum.Friday
    },
    {
      label: 'Saturday',
      value: common.FractionDayOfWeekValueEnum.Saturday
    },
    {
      label: 'Sunday',
      value: common.FractionDayOfWeekValueEnum.Sunday
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildFractionTypeForm();
    this.buildFractionForm();
  }

  buildFractionTypeForm() {
    this.fractionTypeForm = this.fb.group({
      fractionType: [this.fraction.type]
    });
  }

  buildFractionForm() {
    this.fractionForm = this.fb.group({
      dayOfWeekValue: [this.fraction.dayOfWeekValue]
    });
  }

  updateControlFractionFormDayOfWeekValueFromFraction() {
    this.fractionForm.controls['dayOfWeekValue'].setValue(
      this.fraction.dayOfWeekValue
    );
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    switch (fractionType) {
      case common.FractionTypeEnum.DayOfWeekIsAnyValue: {
        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.Or,
          brick: `any`
        };

        this.emitFractionUpdate();
        break;
      }

      case common.FractionTypeEnum.DayOfWeekIs: {
        let newDayOfWeekValue = common.FractionDayOfWeekValueEnum.Monday;

        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.Or,
          dayOfWeekValue: newDayOfWeekValue,
          brick: `${newDayOfWeekValue}`
        };

        this.updateControlFractionFormDayOfWeekValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.DayOfWeekIsNull: {
        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.Or,
          brick: `null`
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.DayOfWeekIsNot: {
        let newDayOfWeekValue = common.FractionDayOfWeekValueEnum.Monday;

        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.And,
          dayOfWeekValue: newDayOfWeekValue,
          brick: `not ${newDayOfWeekValue}`
        };

        this.updateControlFractionFormDayOfWeekValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.DayOfWeekIsNotNull: {
        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.And,
          brick: `not null`
        };

        this.emitFractionUpdate();

        break;
      }

      default: {
      }
    }
  }

  dayOfWeekValueChange(fractionDayOfWeekValueItem: FractionDayOfWeekValueItem) {
    let fractionDayOfWeekValue = fractionDayOfWeekValueItem.value;

    if (this.fraction.type === common.FractionTypeEnum.DayOfWeekIs) {
      this.fraction = {
        type: this.fraction.type,
        operator: common.FractionOperatorEnum.Or,
        dayOfWeekValue: fractionDayOfWeekValue,
        brick: `${fractionDayOfWeekValue}`
      };
    } else if (this.fraction.type === common.FractionTypeEnum.DayOfWeekIsNot) {
      this.fraction = {
        type: this.fraction.type,
        operator: common.FractionOperatorEnum.And,
        dayOfWeekValue: fractionDayOfWeekValue,
        brick: `not ${fractionDayOfWeekValue}`
      };
    }

    this.emitFractionUpdate();
  }
}
