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
  FractionMonthNameValueItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  selector: 'm-fraction-month-name',
  templateUrl: 'fraction-month-name.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionMonthNameComponent implements OnInit {
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  fractionForm: FormGroup;

  fractionMonthNameTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.MonthNameIsAnyValue
    },
    {
      label: 'is',
      value: common.FractionTypeEnum.MonthNameIs
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.MonthNameIsNull
    },
    {
      label: 'is not',
      value: common.FractionTypeEnum.MonthNameIsNot
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.MonthNameIsNotNull
    }
  ];

  fractionMonthNameValuesList: FractionMonthNameValueItem[] = [
    {
      label: 'January',
      value: common.FractionMonthNameValueEnum.January
    },
    {
      label: 'February',
      value: common.FractionMonthNameValueEnum.February
    },
    {
      label: 'March',
      value: common.FractionMonthNameValueEnum.March
    },
    {
      label: 'April',
      value: common.FractionMonthNameValueEnum.April
    },
    {
      label: 'May',
      value: common.FractionMonthNameValueEnum.May
    },
    {
      label: 'June',
      value: common.FractionMonthNameValueEnum.June
    },
    {
      label: 'July',
      value: common.FractionMonthNameValueEnum.July
    },
    {
      label: 'August',
      value: common.FractionMonthNameValueEnum.August
    },
    {
      label: 'September',
      value: common.FractionMonthNameValueEnum.September
    },
    {
      label: 'October',
      value: common.FractionMonthNameValueEnum.October
    },
    {
      label: 'November',
      value: common.FractionMonthNameValueEnum.November
    },
    {
      label: 'December',
      value: common.FractionMonthNameValueEnum.December
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildFractionForm();
  }

  buildFractionForm() {
    this.fractionForm = this.fb.group({
      monthNameValue: [this.fraction.monthNameValue]
    });
  }

  updateControlFractionFormMonthNameValueFromFraction() {
    this.fractionForm.controls['monthNameValue'].setValue(
      this.fraction.monthNameValue
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
      case common.FractionTypeEnum.MonthNameIsAnyValue: {
        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.Or,
          brick: `any`
        };

        this.emitFractionUpdate();
        break;
      }

      case common.FractionTypeEnum.MonthNameIs: {
        let newMonthNameValue = common.FractionMonthNameValueEnum.January;

        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.Or,
          monthNameValue: newMonthNameValue,
          brick: `${newMonthNameValue}`
        };

        this.updateControlFractionFormMonthNameValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.MonthNameIsNull: {
        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.Or,
          brick: `null`
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.MonthNameIsNot: {
        let newMonthNameValue = common.FractionMonthNameValueEnum.January;

        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.And,
          monthNameValue: newMonthNameValue,
          brick: `not ${newMonthNameValue}`
        };

        this.updateControlFractionFormMonthNameValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.MonthNameIsNotNull: {
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

  monthNameValueChange(fractionMonthNameValueItem: FractionMonthNameValueItem) {
    let fractionMonthNameValue = fractionMonthNameValueItem.value;

    if (this.fraction.type === common.FractionTypeEnum.MonthNameIs) {
      this.fraction = {
        type: this.fraction.type,
        operator: common.FractionOperatorEnum.Or,
        monthNameValue: fractionMonthNameValue,
        brick: `${fractionMonthNameValue}`
      };
    } else if (this.fraction.type === common.FractionTypeEnum.MonthNameIsNot) {
      this.fraction = {
        type: this.fraction.type,
        operator: common.FractionOperatorEnum.And,
        monthNameValue: fractionMonthNameValue,
        brick: `not ${fractionMonthNameValue}`
      };
    }

    this.emitFractionUpdate();
  }
}
