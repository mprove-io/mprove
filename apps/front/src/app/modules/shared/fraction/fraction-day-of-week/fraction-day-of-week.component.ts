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

  fractionOperatorEnum = common.FractionOperatorEnum;
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  fractionDayOfWeekTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.DayOfWeekIsAnyValue,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is',
      value: common.FractionTypeEnum.DayOfWeekIs,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.DayOfWeekIsNull,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is not',
      value: common.FractionTypeEnum.DayOfWeekIsNot,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.DayOfWeekIsNotNull,
      operator: common.FractionOperatorEnum.And
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
