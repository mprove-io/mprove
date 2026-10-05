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
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';
import type { FractionQuarterOfYearValue } from '#common/types/blockml/parts/fraction/fraction-quarter-of-year-value';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
import {
  FractionQuarterOfYearValueItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-quarter-of-year',
  templateUrl: 'fraction-quarter-of-year.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionQuarterOfYearComponent {
  readonly fractionOperatorAnd: FractionOperator = 'And';

  @ViewChild('fractionQuarterOfYearTypeSelect', { static: false })
  fractionQuarterOfYearTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionQuarterOfYearValueSelect', { static: false })
  fractionQuarterOfYearValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionQuarterOfYearTypeSelectElement?.close();
    this.fractionQuarterOfYearValueSelectElement?.close();
  }

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionQuarterOfYearTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: 'QuarterOfYearIsAnyValue',
      operator: 'Or'
    },
    {
      label: 'is',
      value: 'QuarterOfYearIs',
      operator: 'Or'
    },
    {
      label: 'is null',
      value: 'QuarterOfYearIsNull',
      operator: 'Or'
    },
    {
      label: 'is not',
      value: 'QuarterOfYearIsNot',
      operator: 'And'
    },
    {
      label: 'is not null',
      value: 'QuarterOfYearIsNotNull',
      operator: 'And'
    }
  ];

  fractionQuarterOfYearValuesList: FractionQuarterOfYearValueItem[] = [
    {
      label: 'Q1',
      value: 'q1'
    },
    {
      label: 'Q2',
      value: 'q2'
    },
    {
      label: 'Q3',
      value: 'q3'
    },
    {
      label: 'Q4',
      value: 'q4'
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
      case 'QuarterOfYearIsAnyValue': {
        this.fraction = {
          type: fractionType,
          operator: 'Or',
          brick: `any`,
          parentBrick: `any`
        };

        this.emitFractionUpdate();
        break;
      }

      case 'QuarterOfYearIs': {
        let newQuarterOfYearValue: FractionQuarterOfYearValue = 'q1';

        this.fraction = {
          type: fractionType,
          operator: 'Or',
          quarterOfYearValue: newQuarterOfYearValue,
          brick: `${newQuarterOfYearValue}`,
          parentBrick: `${newQuarterOfYearValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case 'QuarterOfYearIsNull': {
        this.fraction = {
          type: fractionType,
          operator: 'Or',
          brick: `null`,
          parentBrick: `null`
        };

        this.emitFractionUpdate();

        break;
      }

      case 'QuarterOfYearIsNot': {
        let newQuarterOfYearValue: FractionQuarterOfYearValue = 'q1';

        this.fraction = {
          type: fractionType,
          operator: 'And',
          quarterOfYearValue: newQuarterOfYearValue,
          brick: `not ${newQuarterOfYearValue}`,
          parentBrick: `not ${newQuarterOfYearValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case 'QuarterOfYearIsNotNull': {
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

  quarterOfYearValueChange(
    fractionQuarterOfYearValueItem: FractionQuarterOfYearValueItem
  ) {
    let fractionQuarterOfYearValue = fractionQuarterOfYearValueItem.value;

    if (this.fraction.type === 'QuarterOfYearIs') {
      this.fraction = {
        type: this.fraction.type,
        operator: 'Or',
        quarterOfYearValue: fractionQuarterOfYearValue,
        brick: `${fractionQuarterOfYearValue}`,
        parentBrick: `${fractionQuarterOfYearValue}`
      };
    } else if (this.fraction.type === 'QuarterOfYearIsNot') {
      this.fraction = {
        type: this.fraction.type,
        operator: 'And',
        quarterOfYearValue: fractionQuarterOfYearValue,
        brick: `not ${fractionQuarterOfYearValue}`,
        parentBrick: `not ${fractionQuarterOfYearValue}`
      };
    }

    this.emitFractionUpdate();
  }
}
