import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import {
  FractionQuarterOfYearValueItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  selector: 'm-fraction-quarter-of-year',
  templateUrl: 'fraction-quarter-of-year.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionQuarterOfYearComponent {
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  fractionQuarterOfYearTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.QuarterOfYearIsAnyValue
    },
    {
      label: 'is',
      value: common.FractionTypeEnum.QuarterOfYearIs
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.QuarterOfYearIsNull
    },
    {
      label: 'is not',
      value: common.FractionTypeEnum.QuarterOfYearIsNot
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.QuarterOfYearIsNotNull
    }
  ];

  fractionQuarterOfYearValuesList: FractionQuarterOfYearValueItem[] = [
    {
      label: 'Q1',
      value: common.FractionQuarterOfYearValueEnum.Q1
    },
    {
      label: 'Q2',
      value: common.FractionQuarterOfYearValueEnum.Q2
    },
    {
      label: 'Q3',
      value: common.FractionQuarterOfYearValueEnum.Q3
    },
    {
      label: 'Q4',
      value: common.FractionQuarterOfYearValueEnum.Q4
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
      case common.FractionTypeEnum.QuarterOfYearIsAnyValue: {
        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.Or,
          brick: `any`
        };

        this.emitFractionUpdate();
        break;
      }

      case common.FractionTypeEnum.QuarterOfYearIs: {
        let newQuarterOfYearValue = common.FractionQuarterOfYearValueEnum.Q1;

        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.Or,
          quarterOfYearValue: newQuarterOfYearValue,
          brick: `${newQuarterOfYearValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.QuarterOfYearIsNull: {
        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.Or,
          brick: `null`
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.QuarterOfYearIsNot: {
        let newQuarterOfYearValue = common.FractionQuarterOfYearValueEnum.Q1;

        this.fraction = {
          type: fractionType,
          operator: common.FractionOperatorEnum.And,
          quarterOfYearValue: newQuarterOfYearValue,
          brick: `not ${newQuarterOfYearValue}`
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.QuarterOfYearIsNotNull: {
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

  quarterOfYearValueChange(
    fractionQuarterOfYearValueItem: FractionQuarterOfYearValueItem
  ) {
    let fractionQuarterOfYearValue = fractionQuarterOfYearValueItem.value;

    if (this.fraction.type === common.FractionTypeEnum.QuarterOfYearIs) {
      this.fraction = {
        type: this.fraction.type,
        operator: common.FractionOperatorEnum.Or,
        quarterOfYearValue: fractionQuarterOfYearValue,
        brick: `${fractionQuarterOfYearValue}`
      };
    } else if (
      this.fraction.type === common.FractionTypeEnum.QuarterOfYearIsNot
    ) {
      this.fraction = {
        type: this.fraction.type,
        operator: common.FractionOperatorEnum.And,
        quarterOfYearValue: fractionQuarterOfYearValue,
        brick: `not ${fractionQuarterOfYearValue}`
      };
    }

    this.emitFractionUpdate();
  }
}
