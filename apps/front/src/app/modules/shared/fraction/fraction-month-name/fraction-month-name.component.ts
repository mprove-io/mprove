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

  fractionOperatorEnum = FractionOperatorEnum;
  fractionTypeEnum = FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionMonthNameTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: FractionTypeEnum.MonthNameIsAnyValue,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is',
      value: FractionTypeEnum.MonthNameIs,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: FractionTypeEnum.MonthNameIsNull,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is not',
      value: FractionTypeEnum.MonthNameIsNot,
      operator: FractionOperatorEnum.And
    },
    {
      label: 'is not null',
      value: FractionTypeEnum.MonthNameIsNotNull,
      operator: FractionOperatorEnum.And
    }
  ];

  fractionMonthNameValuesList: FractionMonthNameValueItem[] = [
    {
      label: 'January',
      value: FractionMonthNameValueEnum.January
    },
    {
      label: 'February',
      value: FractionMonthNameValueEnum.February
    },
    {
      label: 'March',
      value: FractionMonthNameValueEnum.March
    },
    {
      label: 'April',
      value: FractionMonthNameValueEnum.April
    },
    {
      label: 'May',
      value: FractionMonthNameValueEnum.May
    },
    {
      label: 'June',
      value: FractionMonthNameValueEnum.June
    },
    {
      label: 'July',
      value: FractionMonthNameValueEnum.July
    },
    {
      label: 'August',
      value: FractionMonthNameValueEnum.August
    },
    {
      label: 'September',
      value: FractionMonthNameValueEnum.September
    },
    {
      label: 'October',
      value: FractionMonthNameValueEnum.October
    },
    {
      label: 'November',
      value: FractionMonthNameValueEnum.November
    },
    {
      label: 'December',
      value: FractionMonthNameValueEnum.December
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
      case FractionTypeEnum.MonthNameIsAnyValue: {
        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.Or,
          brick: `any`
        };

        this.emitFractionUpdate();
        break;
      }

      case FractionTypeEnum.MonthNameIs: {
        let newMonthNameValue = FractionMonthNameValueEnum.January;

        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.Or,
          monthNameValue: newMonthNameValue,
          brick: `${newMonthNameValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.MonthNameIsNull: {
        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.Or,
          brick: `null`
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.MonthNameIsNot: {
        let newMonthNameValue = FractionMonthNameValueEnum.January;

        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.And,
          monthNameValue: newMonthNameValue,
          brick: `not ${newMonthNameValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.MonthNameIsNotNull: {
        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.And,
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

    if (this.fraction.type === FractionTypeEnum.MonthNameIs) {
      this.fraction = {
        type: this.fraction.type,
        operator: FractionOperatorEnum.Or,
        monthNameValue: fractionMonthNameValue,
        brick: `${fractionMonthNameValue}`
      };
    } else if (this.fraction.type === FractionTypeEnum.MonthNameIsNot) {
      this.fraction = {
        type: this.fraction.type,
        operator: FractionOperatorEnum.And,
        monthNameValue: fractionMonthNameValue,
        brick: `not ${fractionMonthNameValue}`
      };
    }

    this.emitFractionUpdate();
  }
}
