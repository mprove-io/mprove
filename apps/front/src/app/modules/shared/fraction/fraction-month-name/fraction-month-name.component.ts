import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import {
  FractionMonthNameValueItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-month-name',
  templateUrl: 'fraction-month-name.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionMonthNameComponent {
  @ViewChild('fractionMonthNameTypeSelect', { static: false })
  fractionMonthNameTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionMonthNameValueSelect', { static: false })
  fractionMonthNameValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionMonthNameTypeSelectElement?.close();
    this.fractionMonthNameValueSelectElement?.close();
  }

  fractionOperatorEnum = common.FractionOperatorEnum;
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  fractionMonthNameTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.MonthNameIsAnyValue,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is',
      value: common.FractionTypeEnum.MonthNameIs,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.MonthNameIsNull,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is not',
      value: common.FractionTypeEnum.MonthNameIsNot,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.MonthNameIsNotNull,
      operator: common.FractionOperatorEnum.And
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
