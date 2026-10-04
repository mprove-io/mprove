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
import type { FractionDayOfWeekValue } from '#common/types/blockml/parts/fraction/fraction-day-of-week-value';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
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

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionDayOfWeekTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: 'DayOfWeekIsAnyValue',
      operator: 'Or'
    },
    {
      label: 'is',
      value: 'DayOfWeekIs',
      operator: 'Or'
    },
    {
      label: 'is null',
      value: 'DayOfWeekIsNull',
      operator: 'Or'
    },
    {
      label: 'is not',
      value: 'DayOfWeekIsNot',
      operator: 'And'
    },
    {
      label: 'is not null',
      value: 'DayOfWeekIsNotNull',
      operator: 'And'
    }
  ];

  fractionDayOfWeekValuesList: FractionDayOfWeekValueItem[] = [
    {
      label: 'Monday',
      value: 'Monday'
    },
    {
      label: 'Tuesday',
      value: 'Tuesday'
    },
    {
      label: 'Wednesday',
      value: 'Wednesday'
    },
    {
      label: 'Thursday',
      value: 'Thursday'
    },
    {
      label: 'Friday',
      value: 'Friday'
    },
    {
      label: 'Saturday',
      value: 'Saturday'
    },
    {
      label: 'Sunday',
      value: 'Sunday'
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
      case 'DayOfWeekIsAnyValue': {
        this.fraction = {
          type: fractionType,
          operator: 'Or',
          brick: `any`,
          parentBrick: `any`
        };

        this.emitFractionUpdate();
        break;
      }

      case 'DayOfWeekIs': {
        let newDayOfWeekValue: FractionDayOfWeekValue = 'Monday';

        this.fraction = {
          type: fractionType,
          operator: 'Or',
          dayOfWeekValue: newDayOfWeekValue,
          brick: `${newDayOfWeekValue}`,
          parentBrick: `${newDayOfWeekValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case 'DayOfWeekIsNull': {
        this.fraction = {
          type: fractionType,
          operator: 'Or',
          brick: `null`,
          parentBrick: `null`
        };

        this.emitFractionUpdate();

        break;
      }

      case 'DayOfWeekIsNot': {
        let newDayOfWeekValue: FractionDayOfWeekValue = 'Monday';

        this.fraction = {
          type: fractionType,
          operator: 'And',
          dayOfWeekValue: newDayOfWeekValue,
          brick: `not ${newDayOfWeekValue}`,
          parentBrick: `not ${newDayOfWeekValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case 'DayOfWeekIsNotNull': {
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

  dayOfWeekValueChange(fractionDayOfWeekValueItem: FractionDayOfWeekValueItem) {
    let fractionDayOfWeekValue = fractionDayOfWeekValueItem.value;

    if (this.fraction.type === 'DayOfWeekIs') {
      this.fraction = {
        type: this.fraction.type,
        operator: 'Or',
        dayOfWeekValue: fractionDayOfWeekValue,
        brick: `${fractionDayOfWeekValue}`,
        parentBrick: `${fractionDayOfWeekValue}`
      };
    } else if (this.fraction.type === 'DayOfWeekIsNot') {
      this.fraction = {
        type: this.fraction.type,
        operator: 'And',
        dayOfWeekValue: fractionDayOfWeekValue,
        brick: `not ${fractionDayOfWeekValue}`,
        parentBrick: `not ${fractionDayOfWeekValue}`
      };
    }

    this.emitFractionUpdate();
  }
}
