import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EventFractionUpdate } from '~front/app/modules/model/model-filters/model-filters.component';
import { common } from '~front/barrels/common';
import {
  FractionQuarterOfYearValueItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  selector: 'm-fraction-quarter-of-year',
  templateUrl: 'fraction-quarter-of-year.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionQuarterOfYearComponent implements OnInit {
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionTypeForm: FormGroup;
  fractionForm: FormGroup;

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

  ngOnInit() {
    this.buildFractionTypeForm();
    this.buildFractionForm();
  }

  buildFractionTypeForm() {
    this.fractionTypeForm = this.fb.group({
      fractionType: [this.fraction.type]
    });
  }

  buildFractionForm() {
    this.fractionForm = this.fb.group({
      quarterOfYearValue: [this.fraction.quarterOfYearValue]
    });
  }

  updateControlFractionFormQuarterOfYearValueFromFraction() {
    this.fractionForm.controls['quarterOfYearValue'].setValue(
      this.fraction.quarterOfYearValue
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

        this.updateControlFractionFormQuarterOfYearValueFromFraction();
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

        this.updateControlFractionFormQuarterOfYearValueFromFraction();
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
