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
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionQuarterOfYearValueEnum } from '~common/enums/fraction/fraction-quarter-of-year-value.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';
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
  @ViewChild('fractionQuarterOfYearTypeSelect', { static: false })
  fractionQuarterOfYearTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionQuarterOfYearValueSelect', { static: false })
  fractionQuarterOfYearValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionQuarterOfYearTypeSelectElement?.close();
    this.fractionQuarterOfYearValueSelectElement?.close();
  }

  fractionOperatorEnum = FractionOperatorEnum;
  fractionTypeEnum = FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionQuarterOfYearTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: FractionTypeEnum.QuarterOfYearIsAnyValue,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is',
      value: FractionTypeEnum.QuarterOfYearIs,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: FractionTypeEnum.QuarterOfYearIsNull,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is not',
      value: FractionTypeEnum.QuarterOfYearIsNot,
      operator: FractionOperatorEnum.And
    },
    {
      label: 'is not null',
      value: FractionTypeEnum.QuarterOfYearIsNotNull,
      operator: FractionOperatorEnum.And
    }
  ];

  fractionQuarterOfYearValuesList: FractionQuarterOfYearValueItem[] = [
    {
      label: 'Q1',
      value: FractionQuarterOfYearValueEnum.Q1
    },
    {
      label: 'Q2',
      value: FractionQuarterOfYearValueEnum.Q2
    },
    {
      label: 'Q3',
      value: FractionQuarterOfYearValueEnum.Q3
    },
    {
      label: 'Q4',
      value: FractionQuarterOfYearValueEnum.Q4
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
      case FractionTypeEnum.QuarterOfYearIsAnyValue: {
        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.Or,
          brick: `any`,
          parentBrick: `any`
        };

        this.emitFractionUpdate();
        break;
      }

      case FractionTypeEnum.QuarterOfYearIs: {
        let newQuarterOfYearValue = FractionQuarterOfYearValueEnum.Q1;

        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.Or,
          quarterOfYearValue: newQuarterOfYearValue,
          brick: `${newQuarterOfYearValue}`,
          parentBrick: `${newQuarterOfYearValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.QuarterOfYearIsNull: {
        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.Or,
          brick: `null`,
          parentBrick: `null`
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.QuarterOfYearIsNot: {
        let newQuarterOfYearValue = FractionQuarterOfYearValueEnum.Q1;

        this.fraction = {
          type: fractionType,
          operator: FractionOperatorEnum.And,
          quarterOfYearValue: newQuarterOfYearValue,
          brick: `not ${newQuarterOfYearValue}`,
          parentBrick: `not ${newQuarterOfYearValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.QuarterOfYearIsNotNull: {
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

  quarterOfYearValueChange(
    fractionQuarterOfYearValueItem: FractionQuarterOfYearValueItem
  ) {
    let fractionQuarterOfYearValue = fractionQuarterOfYearValueItem.value;

    if (this.fraction.type === FractionTypeEnum.QuarterOfYearIs) {
      this.fraction = {
        type: this.fraction.type,
        operator: FractionOperatorEnum.Or,
        quarterOfYearValue: fractionQuarterOfYearValue,
        brick: `${fractionQuarterOfYearValue}`,
        parentBrick: `${fractionQuarterOfYearValue}`
      };
    } else if (this.fraction.type === FractionTypeEnum.QuarterOfYearIsNot) {
      this.fraction = {
        type: this.fraction.type,
        operator: FractionOperatorEnum.And,
        quarterOfYearValue: fractionQuarterOfYearValue,
        brick: `not ${fractionQuarterOfYearValue}`,
        parentBrick: `not ${fractionQuarterOfYearValue}`
      };
    }

    this.emitFractionUpdate();
  }
}
