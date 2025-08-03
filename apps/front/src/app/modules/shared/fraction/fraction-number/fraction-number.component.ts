import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MALLOY_FILTER_ANY } from '~common/constants/top';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import {
  FractionNumberBetweenOptionItem,
  FractionTypeItem
} from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-number',
  templateUrl: 'fraction-number.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionNumberComponent implements OnInit {
  @ViewChild('fractionNumberTypeSelect', { static: false })
  fractionNumberTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionBetweenOptionSelect', { static: false })
  fractionBetweenOptionSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionNumberTypeSelectElement?.close();
    this.fractionBetweenOptionSelectElement?.close();
  }

  defaultNumberValues = '100, 200, 300';
  defaultNumberValue1 = 100;
  defaultNumberValue2 = 200;

  fractionOperatorEnum = common.FractionOperatorEnum;
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  numberValuesForm: FormGroup;
  numberSingleValueForm: FormGroup;
  numberBetweenForm: FormGroup;

  fractionNumberTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.NumberIsAnyValue,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is equal to',
      value: common.FractionTypeEnum.NumberIsEqualTo,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is greater than',
      value: common.FractionTypeEnum.NumberIsGreaterThan,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is greater than or equal to',
      value: common.FractionTypeEnum.NumberIsGreaterThanOrEqualTo,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is less than',
      value: common.FractionTypeEnum.NumberIsLessThan,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is less than or equal to',
      value: common.FractionTypeEnum.NumberIsLessThanOrEqualTo,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is between',
      value: common.FractionTypeEnum.NumberIsBetween,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.NumberIsNull,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is not equal to',
      value: common.FractionTypeEnum.NumberIsNotEqualTo,
      operator: common.FractionOperatorEnum.And
    },
    // {
    //   label: 'is not greater than',
    //   value: common.FractionTypeEnum.NumberIsNotGreaterThan, // not supported (malloy issue)
    //   operator: common.FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not greater than or equal to',
    //   value: common.FractionTypeEnum.NumberIsNotGreaterThanOrEqualTo, // not supported (malloy issue)
    //   operator: common.FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not less than',
    //   value: common.FractionTypeEnum.NumberIsNotLessThan, // not supported (malloy issue)
    //   operator: common.FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not less than or equal to',
    //   value: common.FractionTypeEnum.NumberIsNotLessThanOrEqualTo, // not supported (malloy issue)
    //   operator: common.FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not between',
    //   value: common.FractionTypeEnum.NumberIsNotBetween, // not supported (malloy issue)
    //   operator: common.FractionOperatorEnum.And
    // },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.NumberIsNotNull,
      operator: common.FractionOperatorEnum.And
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
  }

  buildNumberValuesForm() {
    this.numberValuesForm = this.fb.group({
      numberValues: [
        this.fraction.numberValues,
        [
          Validators.required,
          ValidationService.numberValuesOrEmptyValidator,
          Validators.maxLength(255)
        ]
      ]
    });
  }

  buildNumberSingleValueForm() {
    this.numberSingleValueForm = this.fb.group({
      numberValue1: [
        this.fraction.numberValue1,
        [
          Validators.required,
          ValidationService.numberOrEmptyValidator,
          Validators.maxLength(255)
        ]
      ]
    });
  }

  buildNumberBetweenForm() {
    this.numberBetweenForm = this.fb.group({
      numberBetweenFirstValue: [
        this.fraction.numberValue1,
        [
          Validators.required,
          ValidationService.numberOrEmptyValidator,
          Validators.maxLength(255)
        ]
      ],
      numberBetweenSecondValue: [
        this.fraction.numberValue2,
        [
          Validators.required,
          ValidationService.numberOrEmptyValidator,
          Validators.maxLength(255)
        ]
      ]
    });
  }

  // getValueBrick(fractionType: common.FractionTypeEnum, value: string) {
  //   let newBrick =
  //     fractionType === common.FractionTypeEnum.NumberIsEqualTo
  //       ? value
  //       : fractionType === common.FractionTypeEnum.NumberIsNotEqualTo
  //         ? `not ${value}`
  //         : '';

  //   return newBrick;
  // }

  getChangedValueFraction(item: { value: string }) {
    let { value } = item;

    let fractionType = this.fraction.type;

    let sqlBrick =
      fractionType === common.FractionTypeEnum.NumberIsEqualTo
        ? value
        : fractionType === common.FractionTypeEnum.NumberIsNotEqualTo
          ? `not ${value}`
          : '';

    let mBrick =
      fractionType === common.FractionTypeEnum.NumberIsEqualTo
        ? `f\`${value}\``
        : fractionType === common.FractionTypeEnum.NumberIsNotEqualTo
          ? `f\`not ${value}\``
          : '';

    let newFraction: common.Fraction = {
      brick: common.isDefined(this.fraction.parentBrick) ? mBrick : sqlBrick,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: this.fraction.operator,
      type: fractionType,
      numberValues: value
    };

    return newFraction;
  }

  // getSingleBrick(fractionType: common.FractionTypeEnum, value: number) {
  //   let newBrick =
  //     fractionType === common.FractionTypeEnum.NumberIsGreaterThan
  //       ? `> ${value}`
  //       : fractionType === common.FractionTypeEnum.NumberIsGreaterThanOrEqualTo
  //         ? `>= ${value}`
  //         : fractionType === common.FractionTypeEnum.NumberIsLessThan
  //           ? `< ${value}`
  //           : fractionType === common.FractionTypeEnum.NumberIsLessThanOrEqualTo
  //             ? `<= ${value}`
  //             : '';

  //   return newBrick;
  // }

  getChangedSingleFraction(item: { value: number }) {
    let { value } = item;

    let fractionType = this.fraction.type;

    let sqlBrick =
      fractionType === common.FractionTypeEnum.NumberIsGreaterThan
        ? `> ${value}`
        : fractionType === common.FractionTypeEnum.NumberIsGreaterThanOrEqualTo
          ? `>= ${value}`
          : fractionType === common.FractionTypeEnum.NumberIsLessThan
            ? `< ${value}`
            : fractionType === common.FractionTypeEnum.NumberIsLessThanOrEqualTo
              ? `<= ${value}`
              : '';

    let mBrick =
      fractionType === common.FractionTypeEnum.NumberIsGreaterThan
        ? `f\`> ${value}\``
        : fractionType === common.FractionTypeEnum.NumberIsGreaterThanOrEqualTo
          ? `f\`>= ${value}\``
          : fractionType === common.FractionTypeEnum.NumberIsLessThan
            ? `f\`< ${value}\``
            : fractionType === common.FractionTypeEnum.NumberIsLessThanOrEqualTo
              ? `f\`<= ${value}\``
              : '';

    let newFraction: common.Fraction = {
      brick: common.isDefined(this.fraction.parentBrick) ? mBrick : sqlBrick,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: this.fraction.operator,
      type: fractionType,
      numberValue1: Number(value)
    };

    return newFraction;
  }

  // getBetweenBrick(
  //   fractionType: common.FractionTypeEnum,
  //   option: common.FractionNumberBetweenOptionEnum,
  //   n1: number,
  //   n2: number
  // ) {
  //   let content =
  //     option === common.FractionNumberBetweenOptionEnum.Inclusive
  //       ? `[${n1}, ${n2}]`
  //       : option === common.FractionNumberBetweenOptionEnum.LeftInclusive
  //         ? `[${n1}, ${n2})`
  //         : option === common.FractionNumberBetweenOptionEnum.RightInclusive
  //           ? `(${n1}, ${n2}]`
  //           : option === common.FractionNumberBetweenOptionEnum.Exclusive
  //             ? `(${n1}, ${n2})`
  //             : '';

  //   let newBrick =
  //     fractionType === common.FractionTypeEnum.NumberIsBetween
  //       ? content
  //       : fractionType === common.FractionTypeEnum.NumberIsNotBetween
  //         ? `not ${content}`
  //         : '';

  //   return newBrick;
  // }

  getChangedBetweenFraction(item: {
    fractionOperator: common.FractionOperatorEnum;
    fractionType: common.FractionTypeEnum;
    betweenOption: common.FractionNumberBetweenOptionEnum;
    n1: number;
    n2: number;
  }) {
    let { fractionOperator, fractionType, betweenOption, n1, n2 } = item;

    let sqlContent =
      betweenOption === common.FractionNumberBetweenOptionEnum.Inclusive
        ? `[${n1}, ${n2}]`
        : betweenOption === common.FractionNumberBetweenOptionEnum.LeftInclusive
          ? `[${n1}, ${n2})`
          : betweenOption ===
              common.FractionNumberBetweenOptionEnum.RightInclusive
            ? `(${n1}, ${n2}]`
            : betweenOption === common.FractionNumberBetweenOptionEnum.Exclusive
              ? `(${n1}, ${n2})`
              : '';

    let sqlBrick =
      fractionType === common.FractionTypeEnum.NumberIsBetween
        ? sqlContent
        : fractionType === common.FractionTypeEnum.NumberIsNotBetween
          ? `not ${sqlContent}`
          : '';

    let mBrick =
      betweenOption === common.FractionNumberBetweenOptionEnum.Inclusive
        ? fractionType === common.FractionTypeEnum.NumberIsBetween
          ? `f\`[${n1} to ${n2}]\``
          : `f\`not [${n1} to ${n2}]\``
        : betweenOption === common.FractionNumberBetweenOptionEnum.LeftInclusive
          ? fractionType === common.FractionTypeEnum.NumberIsBetween
            ? `f\`[${n1} to ${n2})\``
            : `f\`not [${n1} to ${n2})\``
          : betweenOption ===
              common.FractionNumberBetweenOptionEnum.RightInclusive
            ? fractionType === common.FractionTypeEnum.NumberIsBetween
              ? `f\`(${n1} to ${n2}]\``
              : `f\`not (${n1} to ${n2}]\``
            : betweenOption === common.FractionNumberBetweenOptionEnum.Exclusive
              ? fractionType === common.FractionTypeEnum.NumberIsBetween
                ? `f\`(${n1} to ${n2})\``
                : `f\`not (${n1} to ${n2})\``
              : '';

    let newFraction: common.Fraction = {
      brick: common.isDefined(this.fraction.parentBrick) ? mBrick : sqlBrick,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: fractionOperator,
      type: fractionType,
      numberBetweenOption: betweenOption,
      numberValue1: n1,
      numberValue2: n2
    };

    return newFraction;
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

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    switch (fractionType) {
      case this.fractionTypeEnum.NumberIsAnyValue: {
        let mBrick = MALLOY_FILTER_ANY;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `any`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsEqualTo: {
        let newNumberValues = this.defaultNumberValues;

        let mBrick = `f\`${newNumberValues}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `${newNumberValues}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
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

        let mBrick = `f\`> ${newNumberValue1}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `> ${newNumberValue1}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
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

        let mBrick = `f\`>= ${newNumberValue1}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `>= ${newNumberValue1}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
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

        let mBrick = `f\`< ${newNumberValue1}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `< ${newNumberValue1}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
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

        let mBrick = `f\`<= ${newNumberValue1}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `<= ${newNumberValue1}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsNull: {
        let mBrick = 'f`null`';

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `null`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
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

        // let newBrick = this.getBetweenBrick(
        //   fractionType,
        //   newBetweenOption,
        //   newNumberValue1,
        //   newNumberValue2
        // );

        // this.fraction = {
        //   brick: newBrick,
        //   operator: common.FractionOperatorEnum.Or,
        //   type: fractionType,
        //   numberBetweenOption: newBetweenOption,
        //   numberValue1: newNumberValue1,
        //   numberValue2: newNumberValue2
        // };

        this.fraction = this.getChangedBetweenFraction({
          fractionOperator: common.FractionOperatorEnum.Or,
          fractionType: fractionType,
          betweenOption: newBetweenOption,
          n1: newNumberValue1,
          n2: newNumberValue2
        });

        this.updateControlBetweenFormFirstValueFromFraction();
        this.updateControlBetweenFormSecondValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsNotEqualTo: {
        let newNumberValues = this.defaultNumberValues;

        let mBrick = `f\`not ${newNumberValues}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not ${newNumberValues}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
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

        // let newBrick = this.getBetweenBrick(
        //   fractionType,
        //   newBetweenOption,
        //   newNumberValue1,
        //   newNumberValue2
        // );

        // this.fraction = {
        //   brick: newBrick,
        //   operator: common.FractionOperatorEnum.And,
        //   type: fractionType,
        //   numberBetweenOption: newBetweenOption,
        //   numberValue1: newNumberValue1,
        //   numberValue2: newNumberValue2
        // };

        this.fraction = this.getChangedBetweenFraction({
          fractionOperator: common.FractionOperatorEnum.And,
          fractionType: fractionType,
          betweenOption: newBetweenOption,
          n1: newNumberValue1,
          n2: newNumberValue2
        });

        this.updateControlBetweenFormFirstValueFromFraction();
        this.updateControlBetweenFormSecondValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsNotNull: {
        let mBrick = 'f`not null`';

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not null`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
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

    // let newBrick = this.getBetweenBrick(
    //   this.fraction.type,
    //   fractionBetweenOption,
    //   newNumberValue1,
    //   newNumberValue2
    // );

    // this.fraction = {
    //   brick: newBrick,
    //   operator: this.fraction.operator,
    //   type: this.fraction.type,
    //   numberBetweenOption: fractionBetweenOption,
    //   numberValue1: newNumberValue1,
    //   numberValue2: newNumberValue2
    // };

    this.fraction = this.getChangedBetweenFraction({
      fractionOperator: this.fraction.operator,
      fractionType: this.fraction.type,
      betweenOption: fractionBetweenOption,
      n1: newNumberValue1,
      n2: newNumberValue2
    });

    this.updateControlBetweenFormFirstValueFromFraction();
    this.updateControlBetweenFormSecondValueFromFraction();
    this.emitFractionUpdate();
  }

  numberValuesBlur() {
    let value = this.numberValuesForm.controls['numberValues'].value;

    if (value !== this.fraction.numberValues) {
      // let newBrick = this.getValueBrick(this.fraction.type, value);

      // this.fraction = {
      //   brick: newBrick,
      //   operator: this.fraction.operator,
      //   type: this.fraction.type,
      //   numberValues: value
      // };

      this.fraction = this.getChangedValueFraction({
        value: value
      });

      if (this.numberValuesForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  numberSingleValueBlur() {
    let value = this.numberSingleValueForm.controls['numberValue1'].value;

    if (value !== this.fraction.numberValue1) {
      // let newBrick = this.getSingleBrick(this.fraction.type, value);

      // this.fraction = {
      //   brick: newBrick,
      //   operator: this.fraction.operator,
      //   type: this.fraction.type,
      //   numberValue1: Number(value)
      // };

      this.fraction = this.getChangedSingleFraction({
        value: value
      });

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

    // let newBrick = this.getBetweenBrick(
    //   this.fraction.type,
    //   this.fraction.numberBetweenOption,
    //   value,
    //   this.fraction.numberValue2
    // );

    // this.fraction = {
    //   brick: newBrick,
    //   operator: this.fraction.operator,
    //   type: this.fraction.type,
    //   numberBetweenOption: this.fraction.numberBetweenOption,
    //   numberValue1: Number(value),
    //   numberValue2: this.fraction.numberValue2
    // };

    this.fraction = this.getChangedBetweenFraction({
      fractionOperator: this.fraction.operator,
      fractionType: this.fraction.type,
      betweenOption: this.fraction.numberBetweenOption,
      n1: Number(value),
      n2: this.fraction.numberValue2
    });

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

    // let newBrick = this.getBetweenBrick(
    //   this.fraction.type,
    //   this.fraction.numberBetweenOption,
    //   this.fraction.numberValue1,
    //   value
    // );

    // this.fraction = {
    //   brick: newBrick,
    //   operator: this.fraction.operator,
    //   type: this.fraction.type,
    //   numberBetweenOption: this.fraction.numberBetweenOption,
    //   numberValue1: this.fraction.numberValue1,
    //   numberValue2: Number(value)
    // };

    this.fraction = this.getChangedBetweenFraction({
      fractionOperator: this.fraction.operator,
      fractionType: this.fraction.type,
      betweenOption: this.fraction.numberBetweenOption,
      n1: this.fraction.numberValue1,
      n2: Number(value)
    });

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
