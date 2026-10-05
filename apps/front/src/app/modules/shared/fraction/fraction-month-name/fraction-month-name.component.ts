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
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionMonthNameValue } from '#common/types/blockml/parts/fraction/fraction-month-name-value';
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
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
  readonly fractionOperatorAnd: FractionOperator = 'And';

  @ViewChild('fractionMonthNameTypeSelect', { static: false })
  fractionMonthNameTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionMonthNameValueSelect', { static: false })
  fractionMonthNameValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionMonthNameTypeSelectElement?.close();
    this.fractionMonthNameValueSelectElement?.close();
  }

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionMonthNameTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: 'MonthNameIsAnyValue',
      operator: 'Or'
    },
    {
      label: 'is',
      value: 'MonthNameIs',
      operator: 'Or'
    },
    {
      label: 'is null',
      value: 'MonthNameIsNull',
      operator: 'Or'
    },
    {
      label: 'is not',
      value: 'MonthNameIsNot',
      operator: 'And'
    },
    {
      label: 'is not null',
      value: 'MonthNameIsNotNull',
      operator: 'And'
    }
  ];

  fractionMonthNameValuesList: FractionMonthNameValueItem[] = [
    {
      label: 'January',
      value: 'January'
    },
    {
      label: 'February',
      value: 'February'
    },
    {
      label: 'March',
      value: 'March'
    },
    {
      label: 'April',
      value: 'April'
    },
    {
      label: 'May',
      value: 'May'
    },
    {
      label: 'June',
      value: 'June'
    },
    {
      label: 'July',
      value: 'July'
    },
    {
      label: 'August',
      value: 'August'
    },
    {
      label: 'September',
      value: 'September'
    },
    {
      label: 'October',
      value: 'October'
    },
    {
      label: 'November',
      value: 'November'
    },
    {
      label: 'December',
      value: 'December'
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
      case 'MonthNameIsAnyValue': {
        this.fraction = {
          type: fractionType,
          operator: 'Or',
          brick: `any`,
          parentBrick: `any`
        };

        this.emitFractionUpdate();
        break;
      }

      case 'MonthNameIs': {
        let newMonthNameValue: FractionMonthNameValue = 'January';

        this.fraction = {
          type: fractionType,
          operator: 'Or',
          monthNameValue: newMonthNameValue,
          brick: `${newMonthNameValue}`,
          parentBrick: `${newMonthNameValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case 'MonthNameIsNull': {
        this.fraction = {
          type: fractionType,
          operator: 'Or',
          brick: `null`,
          parentBrick: `null`
        };

        this.emitFractionUpdate();

        break;
      }

      case 'MonthNameIsNot': {
        let newMonthNameValue: FractionMonthNameValue = 'January';

        this.fraction = {
          type: fractionType,
          operator: 'And',
          monthNameValue: newMonthNameValue,
          brick: `not ${newMonthNameValue}`,
          parentBrick: `not ${newMonthNameValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case 'MonthNameIsNotNull': {
        this.fraction = {
          type: fractionType,
          operator: 'And',
          brick: `not null`,
          parentBrick: `not null`
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

    if (this.fraction.type === 'MonthNameIs') {
      this.fraction = {
        type: this.fraction.type,
        operator: 'Or',
        monthNameValue: fractionMonthNameValue,
        brick: `${fractionMonthNameValue}`,
        parentBrick: `${fractionMonthNameValue}`
      };
    } else if (this.fraction.type === 'MonthNameIsNot') {
      this.fraction = {
        type: this.fraction.type,
        operator: 'And',
        monthNameValue: fractionMonthNameValue,
        brick: `not ${fractionMonthNameValue}`,
        parentBrick: `not ${fractionMonthNameValue}`
      };
    }

    this.emitFractionUpdate();
  }
}
