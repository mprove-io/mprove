import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { FractionTypeItem } from '../fraction.component';

@Component({
  selector: 'm-fraction-string',
  templateUrl: 'fraction-string.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionStringComponent implements OnInit {
  defaultStringValue = 'abc';
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  fractionForm: FormGroup;

  fractionStringTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.StringIsAnyValue,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is equal to',
      value: common.FractionTypeEnum.StringIsEqualTo,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'contains',
      value: common.FractionTypeEnum.StringContains,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'starts with',
      value: common.FractionTypeEnum.StringStartsWith,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'ends with',
      value: common.FractionTypeEnum.StringEndsWith,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.StringIsNull,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is blank',
      value: common.FractionTypeEnum.StringIsBlank,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is not equal to',
      value: common.FractionTypeEnum.StringIsNotEqualTo,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'does not contain',
      value: common.FractionTypeEnum.StringDoesNotContain,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'does not start with',
      value: common.FractionTypeEnum.StringDoesNotStartWith,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'does not end with',
      value: common.FractionTypeEnum.StringDoesNotEndWith,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.StringIsNotNull,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not blank',
      value: common.FractionTypeEnum.StringIsNotBlank,
      operator: common.FractionOperatorEnum.And
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildFractionForm();
  }

  buildFractionForm() {
    this.fractionForm = this.fb.group({
      stringValue: [
        this.fraction.stringValue,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });
  }

  stringValueBlur() {
    let value = this.fractionForm.controls['stringValue'].value;

    if (value !== this.fraction.stringValue) {
      let newBrick = this.getValueBrick(this.fraction.type, value);

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        stringValue: value
      };

      if (this.fractionForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  updateControlValueFromFraction() {
    this.fractionForm.controls['stringValue'].setValue(
      this.fraction.stringValue
    );
  }

  getValueBrick(fractionType: common.FractionTypeEnum, value: string) {
    let newBrick =
      fractionType === common.FractionTypeEnum.StringIsEqualTo
        ? `-${value}-`
        : fractionType === common.FractionTypeEnum.StringContains
        ? `%${value}%`
        : fractionType === common.FractionTypeEnum.StringStartsWith
        ? `${value}%`
        : fractionType === common.FractionTypeEnum.StringEndsWith
        ? `%${value}`
        : fractionType === common.FractionTypeEnum.StringIsNotEqualTo
        ? `not -${value}-`
        : fractionType === common.FractionTypeEnum.StringDoesNotContain
        ? `not %${value}%`
        : fractionType === common.FractionTypeEnum.StringDoesNotStartWith
        ? `${value}% not`
        : fractionType === common.FractionTypeEnum.StringDoesNotEndWith
        ? `not %${value}`
        : '';

    return newBrick;
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
      case this.fractionTypeEnum.StringIsAnyValue: {
        this.fraction = {
          brick: `any`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsEqualTo: {
        this.fraction = {
          brick: `-${this.defaultStringValue}-`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.StringContains: {
        this.fraction = {
          brick: `%${this.defaultStringValue}%`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.StringStartsWith: {
        this.fraction = {
          brick: `${this.defaultStringValue}%`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.StringEndsWith: {
        this.fraction = {
          brick: `%${this.defaultStringValue}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.StringIsNull: {
        this.fraction = {
          brick: `null`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsBlank: {
        this.fraction = {
          brick: `blank`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsNotEqualTo: {
        this.fraction = {
          brick: `not -${this.defaultStringValue}-`,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringDoesNotContain: {
        this.fraction = {
          brick: `not %${this.defaultStringValue}%`,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringDoesNotStartWith: {
        this.fraction = {
          brick: `${this.defaultStringValue}% not`,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringDoesNotEndWith: {
        this.fraction = {
          brick: `not %${this.defaultStringValue}`,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsNotNull: {
        this.fraction = {
          brick: `not null`,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsNotBlank: {
        this.fraction = {
          brick: `not blank`,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      default: {
      }
    }
  }
}
