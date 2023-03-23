import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import {
  FractionNumberBetweenOptionItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  selector: 'm-fraction-number',
  templateUrl: 'fraction-number.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionNumberComponent implements OnInit {
  defaultNumberValues = '100, 200, 300';
  defaultNumberValue1 = 100;
  defaultNumberValue2 = 200;

  fractionTypeEnum = common.FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  numberValuesForm: FormGroup;
  numberSingleValueForm: FormGroup;
  numberBetweenForm: FormGroup;

  numberBetweenOptionsForm: FormGroup;

  fractionNumberTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.NumberIsAnyValue
    },
    {
      label: 'is equal to',
      value: common.FractionTypeEnum.NumberIsEqualTo
    },
    {
      label: 'is greater than',
      value: common.FractionTypeEnum.NumberIsGreaterThan
    },
    {
      label: 'is greater or equal',
      value: common.FractionTypeEnum.NumberIsGreaterThanOrEqualTo
    },
    {
      label: 'is less than',
      value: common.FractionTypeEnum.NumberIsLessThan
    },
    {
      label: 'is less or equal',
      value: common.FractionTypeEnum.NumberIsLessThanOrEqualTo
    },
    {
      label: 'is between',
      value: common.FractionTypeEnum.NumberIsBetween
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.NumberIsNull
    },
    {
      label: 'is not equal to',
      value: common.FractionTypeEnum.NumberIsNotEqualTo
    },
    {
      label: 'is not between',
      value: common.FractionTypeEnum.NumberIsNotBetween
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.NumberIsNotNull
    }
  ];

  fractionNumberBetweenOptionsList: FractionNumberBetweenOptionItem[] = [
    {
      label: '[inclusive]',
      value: common.FractionNumberBetweenOptionEnum.Inclusive
    },
    {
      label: '[left inclusive)',
      value: common.FractionNumberBetweenOptionEnum.LeftInclusive
    },
    {
      label: '(right inclusive]',
      value: common.FractionNumberBetweenOptionEnum.RightInclusive
    },
    {
      label: '(exclusive)',
      value: common.FractionNumberBetweenOptionEnum.Exclusive
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildNumberValuesForm();
    this.buildNumberSingleValueForm();
    this.buildNumberBetweenForm();
    this.buildNumberBetweenOptionsForm();
  }

  buildNumberValuesForm() {
    this.numberValuesForm = this.fb.group({
      numberValues: [
        this.fraction.numberValues,
        Validators.compose([
          Validators.required,
          ValidationService.numberValuesOrEmptyValidator,
          Validators.maxLength(255)
        ])
      ]
    });
  }

  buildNumberSingleValueForm() {
    this.numberSingleValueForm = this.fb.group({
      numberValue1: [
        this.fraction.numberValue1,
        Validators.compose([
          Validators.required,
          ValidationService.numberOrEmptyValidator,
          Validators.maxLength(255)
        ])
      ]
    });
  }

  buildNumberBetweenForm() {
    this.numberBetweenForm = this.fb.group({
      numberBetweenFirstValue: [
        this.fraction.numberValue1,
        Validators.compose([
          Validators.required,
          ValidationService.numberOrEmptyValidator,
          Validators.maxLength(255)
        ])
      ],
      numberBetweenSecondValue: [
        this.fraction.numberValue2,
        Validators.compose([
          Validators.required,
          ValidationService.numberOrEmptyValidator,
          Validators.maxLength(255)
        ])
      ]
    });
  }

  buildNumberBetweenOptionsForm() {
    this.numberBetweenOptionsForm = this.fb.group({
      numberBetweenOption: [this.fraction.numberBetweenOption]
    });
  }

  getValueBrick(fractionType: common.FractionTypeEnum, value: string) {
    let newBrick =
      fractionType === common.FractionTypeEnum.NumberIsEqualTo
        ? value
        : fractionType === common.FractionTypeEnum.NumberIsNotEqualTo
        ? `not ${value}`
        : '';

    return newBrick;
  }

  getSingleBrick(fractionType: common.FractionTypeEnum, value: number) {
    let newBrick =
      fractionType === common.FractionTypeEnum.NumberIsGreaterThan
        ? `> ${value}`
        : fractionType === common.FractionTypeEnum.NumberIsGreaterThanOrEqualTo
        ? `>= ${value}`
        : fractionType === common.FractionTypeEnum.NumberIsLessThan
        ? `< ${value}`
        : fractionType === common.FractionTypeEnum.NumberIsLessThanOrEqualTo
        ? `<= ${value}`
        : '';

    return newBrick;
  }

  getBetweenBrick(
    fractionType: common.FractionTypeEnum,
    option: common.FractionNumberBetweenOptionEnum,
    n1: number,
    n2: number
  ) {
    let content =
      option === common.FractionNumberBetweenOptionEnum.Inclusive
        ? `[${n1}, ${n2}]`
        : option === common.FractionNumberBetweenOptionEnum.LeftInclusive
        ? `[${n1}, ${n2})`
        : option === common.FractionNumberBetweenOptionEnum.RightInclusive
        ? `(${n1}, ${n2}]`
        : option === common.FractionNumberBetweenOptionEnum.Exclusive
        ? `(${n1}, ${n2})`
        : '';

    let newBrick =
      fractionType === common.FractionTypeEnum.NumberIsBetween
        ? content
        : fractionType === common.FractionTypeEnum.NumberIsNotBetween
        ? `not ${content}`
        : '';

    return newBrick;
  }

  updateControlNumberValuesFromFraction() {
    this.numberValuesForm.controls['numberValues'].setValue(
      this.fraction.numberValues
    );
  }

  updateControlSingleValueFormNumberValue1FromFraction() {
    this.numberSingleValueForm.controls['numberValue1'].setValue(
      this.fraction.numberValue1
    );
  }

  updateControlBetweenFormFirstValueFromFraction() {
    this.numberBetweenForm.controls['numberBetweenFirstValue'].setValue(
      this.fraction.numberValue1
    );
  }

  updateControlBetweenFormSecondValueFromFraction() {
    this.numberBetweenForm.controls['numberBetweenSecondValue'].setValue(
      this.fraction.numberValue2
    );
  }

  updateControlBetweenOptionsFormBetweenOptionFromFraction() {
    this.numberBetweenOptionsForm.controls['numberBetweenOption'].setValue(
      this.fraction.numberBetweenOption
    );
  }

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    switch (fractionType) {
      case this.fractionTypeEnum.NumberIsAnyValue: {
        this.fraction = {
          brick: `any`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsEqualTo: {
        let newNumberValues = this.defaultNumberValues;

        this.fraction = {
          brick: `${newNumberValues}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          numberValues: newNumberValues
        };

        this.updateControlNumberValuesFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsGreaterThan: {
        let newNumberValue1 = this.defaultNumberValue1;

        this.fraction = {
          brick: `> ${newNumberValue1}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsGreaterThanOrEqualTo: {
        let newNumberValue1 = this.defaultNumberValue1;

        this.fraction = {
          brick: `>= ${newNumberValue1}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsLessThan: {
        let newNumberValue1 = this.defaultNumberValue1;

        this.fraction = {
          brick: `< ${newNumberValue1}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsLessThanOrEqualTo: {
        let newNumberValue1 = this.defaultNumberValue1;

        this.fraction = {
          brick: `<= ${newNumberValue1}`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsNull: {
        this.fraction = {
          brick: `null`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsBetween: {
        let newBetweenOption = common.FractionNumberBetweenOptionEnum.Inclusive;
        let newNumberValue1 = this.defaultNumberValue1;
        let newNumberValue2 = this.defaultNumberValue2;

        let newBrick = this.getBetweenBrick(
          fractionType,
          newBetweenOption,
          newNumberValue1,
          newNumberValue2
        );

        this.fraction = {
          brick: newBrick,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          numberBetweenOption: newBetweenOption,
          numberValue1: newNumberValue1,
          numberValue2: newNumberValue2
        };

        this.updateControlBetweenOptionsFormBetweenOptionFromFraction();
        this.updateControlBetweenFormFirstValueFromFraction();
        this.updateControlBetweenFormSecondValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsNotEqualTo: {
        let newNumberValues = this.defaultNumberValues;

        this.fraction = {
          brick: `not ${newNumberValues}`,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          numberValues: newNumberValues
        };

        this.updateControlNumberValuesFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.NumberIsNotBetween: {
        let newBetweenOption = common.FractionNumberBetweenOptionEnum.Inclusive;
        let newNumberValue1 = this.defaultNumberValue1;
        let newNumberValue2 = this.defaultNumberValue2;

        let newBrick = this.getBetweenBrick(
          fractionType,
          newBetweenOption,
          newNumberValue1,
          newNumberValue2
        );

        this.fraction = {
          brick: newBrick,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          numberBetweenOption: newBetweenOption,
          numberValue1: newNumberValue1,
          numberValue2: newNumberValue2
        };

        this.updateControlBetweenOptionsFormBetweenOptionFromFraction();
        this.updateControlBetweenFormFirstValueFromFraction();
        this.updateControlBetweenFormSecondValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsNotNull: {
        this.fraction = {
          brick: `not null`,
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

  betweenOptionChange(fractionBetweenItem: FractionNumberBetweenOptionItem) {
    let fractionBetweenOption = fractionBetweenItem.value;
    let newNumberValue1 = this.defaultNumberValue1;
    let newNumberValue2 = this.defaultNumberValue2;

    let newBrick = this.getBetweenBrick(
      this.fraction.type,
      fractionBetweenOption,
      newNumberValue1,
      newNumberValue2
    );

    this.fraction = {
      brick: newBrick,
      operator: this.fraction.operator,
      type: this.fraction.type,
      numberBetweenOption: fractionBetweenOption,
      numberValue1: newNumberValue1,
      numberValue2: newNumberValue2
    };

    this.updateControlBetweenFormFirstValueFromFraction();
    this.updateControlBetweenFormSecondValueFromFraction();
    this.emitFractionUpdate();
  }

  numberValuesBlur() {
    let value = this.numberValuesForm.controls['numberValues'].value;

    if (value !== this.fraction.numberValues) {
      let newBrick = this.getValueBrick(this.fraction.type, value);

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        numberValues: value
      };

      if (this.numberValuesForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  numberSingleValueBlur() {
    let value = this.numberSingleValueForm.controls['numberValue1'].value;

    if (value !== this.fraction.numberValue1) {
      let newBrick = this.getSingleBrick(this.fraction.type, value);

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        numberValue1: Number(value)
      };

      if (this.numberSingleValueForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  numberBetweenFirstValueBlur() {
    let value =
      this.numberBetweenForm.controls['numberBetweenFirstValue'].value;

    if (value === this.fraction.numberValue1) {
      return;
    }

    let newBrick = this.getBetweenBrick(
      this.fraction.type,
      this.fraction.numberBetweenOption,
      value,
      this.fraction.numberValue2
    );

    this.fraction = {
      brick: newBrick,
      operator: this.fraction.operator,
      type: this.fraction.type,
      numberBetweenOption: this.fraction.numberBetweenOption,
      numberValue1: Number(value),
      numberValue2: this.fraction.numberValue2
    };

    if (this.numberBetweenForm.valid) {
      this.emitFractionUpdate();
    }
  }

  numberBetweenSecondValueBlur() {
    let value =
      this.numberBetweenForm.controls['numberBetweenSecondValue'].value;

    if (value === this.fraction.numberValue2) {
      return;
    }

    let newBrick = this.getBetweenBrick(
      this.fraction.type,
      this.fraction.numberBetweenOption,
      this.fraction.numberValue1,
      value
    );

    this.fraction = {
      brick: newBrick,
      operator: this.fraction.operator,
      type: this.fraction.type,
      numberBetweenOption: this.fraction.numberBetweenOption,
      numberValue1: this.fraction.numberValue1,
      numberValue2: Number(value)
    };

    if (this.numberBetweenForm.valid) {
      this.emitFractionUpdate();
    }
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }
}
