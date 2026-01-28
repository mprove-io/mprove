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
import { FractionDayOfWeekValueEnum } from '#common/enums/fraction/fraction-day-of-week-value.enum';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { Fraction } from '#common/interfaces/blockml/fraction';
import { EventFractionUpdate } from '#common/interfaces/front/event-fraction-update';
import {
  FractionDayOfWeekValueItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-day-of-week',
  templateUrl: 'fraction-day-of-week.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionDayOfWeekComponent {
  @ViewChild('fractionDayOfWeekTypeSelect', { static: false })
  fractionDayOfWeekTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionDayOfWeekValueSelect', { static: false })
  fractionDayOfWeekValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionDayOfWeekTypeSelectElement?.close();
    this.fractionDayOfWeekValueSelectElement?.close();
  }

  fractionOperatorEnum = FractionOperatorEnum;
  fractionTypeEnum = FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionDayOfWeekTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: FractionTypeEnum.DayOfWeekIsAnyValue,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is',
      value: FractionTypeEnum.DayOfWeekIs,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: FractionTypeEnum.DayOfWeekIsNull,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is not',
      value: FractionTypeEnum.DayOfWeekIsNot,
      operator: FractionOperatorEnum.And
    },
    {
      label: 'is not null',
      value: FractionTypeEnum.DayOfWeekIsNotNull,
      operator: FractionOperatorEnum.And
    }
  ];

  fractionDayOfWeekValuesList: FractionDayOfWeekValueItem[] = [
    {
      label: 'Monday',
      value: FractionDayOfWeekValueEnum.Monday
    },
    {
      label: 'Tuesday',
      value: FractionDayOfWeekValueEnum.Tuesday
    },
    {
      label: 'Wednesday',
      value: FractionDayOfWeekValueEnum.Wednesday
    },
    {
      label: 'Thursday',
      value: FractionDayOfWeekValueEnum.Thursday
    },
    {
      label: 'Friday',
      value: FractionDayOfWeekValueEnum.Friday
    },
    {
      label: 'Saturday',
      value: FractionDayOfWeekValueEnum.Saturday
    },
    {
      label: 'Sunday',
      value: FractionDayOfWeekValueEnum.Sunday
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
      case FractionTypeEnum.DayOfWeekIsAnyValue: {
        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.Or,
          brick: `any`,
          parentBrick: `any`
        };

        this.emitFractionUpdate();
        break;
      }

      case FractionTypeEnum.DayOfWeekIs: {
        let newDayOfWeekValue = FractionDayOfWeekValueEnum.Monday;

        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.Or,
          dayOfWeekValue: newDayOfWeekValue,
          brick: `${newDayOfWeekValue}`,
          parentBrick: `${newDayOfWeekValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.DayOfWeekIsNull: {
        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.Or,
          brick: `null`,
          parentBrick: `null`
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.DayOfWeekIsNot: {
        let newDayOfWeekValue = FractionDayOfWeekValueEnum.Monday;

        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.And,
          dayOfWeekValue: newDayOfWeekValue,
          brick: `not ${newDayOfWeekValue}`,
          parentBrick: `not ${newDayOfWeekValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.DayOfWeekIsNotNull: {
        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.And,
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

  dayOfWeekValueChange(fractionDayOfWeekValueItem: FractionDayOfWeekValueItem) {
    let fractionDayOfWeekValue = fractionDayOfWeekValueItem.value;

    if (this.fraction.type === FractionTypeEnum.DayOfWeekIs) {
      this.fraction = {
        type: this.fraction.type,
        operator: FractionOperatorEnum.Or,
        dayOfWeekValue: fractionDayOfWeekValue,
        brick: `${fractionDayOfWeekValue}`,
        parentBrick: `${fractionDayOfWeekValue}`
      };
    } else if (this.fraction.type === FractionTypeEnum.DayOfWeekIsNot) {
      this.fraction = {
        type: this.fraction.type,
        operator: FractionOperatorEnum.And,
        dayOfWeekValue: fractionDayOfWeekValue,
        brick: `not ${fractionDayOfWeekValue}`,
        parentBrick: `not ${fractionDayOfWeekValue}`
      };
    }

    this.emitFractionUpdate();
  }
}
