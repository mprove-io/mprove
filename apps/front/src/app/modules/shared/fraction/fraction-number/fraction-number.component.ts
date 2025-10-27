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
import { FractionNumberBetweenOptionEnum } from '~common/enums/fraction/fraction-number-between-option.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';
import { ValidationService } from '~front/app/services/validation.service';
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

  fractionOperatorEnum = FractionOperatorEnum;
  fractionTypeEnum = FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  numberValuesForm: FormGroup;
  numberSingleValueForm: FormGroup;
  numberBetweenForm: FormGroup;

  fractionNumberTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: FractionTypeEnum.NumberIsAnyValue,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is equal to',
      value: FractionTypeEnum.NumberIsEqualTo,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is greater than',
      value: FractionTypeEnum.NumberIsGreaterThan,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is greater than or equal to',
      value: FractionTypeEnum.NumberIsGreaterThanOrEqualTo,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is less than',
      value: FractionTypeEnum.NumberIsLessThan,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is less than or equal to',
      value: FractionTypeEnum.NumberIsLessThanOrEqualTo,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is between',
      value: FractionTypeEnum.NumberIsBetween,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: FractionTypeEnum.NumberIsNull,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is not equal to',
      value: FractionTypeEnum.NumberIsNotEqualTo,
      operator: FractionOperatorEnum.And
    },
    // { // TODO: check malloy progress
    //   label: 'is not greater than',
    //   value: FractionTypeEnum.NumberIsNotGreaterThan, // not supported (malloy issue)
    //   operator: FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not greater than or equal to',
    //   value: FractionTypeEnum.NumberIsNotGreaterThanOrEqualTo, // not supported (malloy issue)
    //   operator: FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not less than',
    //   value: FractionTypeEnum.NumberIsNotLessThan, // not supported (malloy issue)
    //   operator: FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not less than or equal to',
    //   value: FractionTypeEnum.NumberIsNotLessThanOrEqualTo, // not supported (malloy issue)
    //   operator: FractionOperatorEnum.And
    // },
    // {
    //   label: 'is not between', // malloy - test combined with other NOTs
    //   value: FractionTypeEnum.NumberIsNotBetween,
    //   operator: FractionOperatorEnum.And
    // },
    {
      label: 'is not null',
      value: FractionTypeEnum.NumberIsNotNull,
      operator: FractionOperatorEnum.And
    }
  ];

  fractionNumberBetweenOptionsList: FractionNumberBetweenOptionItem[] = [
    {
      label: '[inclusive]',
      value: FractionNumberBetweenOptionEnum.Inclusive
    },
    {
      label: '[left inclusive)',
      value: FractionNumberBetweenOptionEnum.LeftInclusive
    },
    {
      label: '(right inclusive]',
      value: FractionNumberBetweenOptionEnum.RightInclusive
    },
    {
      label: '(exclusive)',
      value: FractionNumberBetweenOptionEnum.Exclusive
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

  getChangedValueFraction(item: { value: string }) {
    let { value } = item;

    let fractionType = this.fraction.type;

    let sqlBrick =
      fractionType === FractionTypeEnum.NumberIsEqualTo
        ? value
        : fractionType === FractionTypeEnum.NumberIsNotEqualTo
          ? `not ${value}`
          : '';

    let mBrick =
      fractionType === FractionTypeEnum.NumberIsEqualTo
        ? `f\`${value}\``
        : fractionType === FractionTypeEnum.NumberIsNotEqualTo
          ? `f\`not ${value}\``
          : '';

    let newFraction: Fraction = {
      brick: isDefined(this.fraction.parentBrick) ? mBrick : sqlBrick,
      parentBrick: isDefined(this.fraction.parentBrick) ? mBrick : undefined,
      operator: this.fraction.operator,
      type: fractionType,
      numberValues: value
    };

    return newFraction;
  }

  getChangedSingleFraction(item: { value: number }) {
    let { value } = item;

    let fractionType = this.fraction.type;

    let sqlBrick =
      fractionType === FractionTypeEnum.NumberIsGreaterThan
        ? `> ${value}`
        : fractionType === FractionTypeEnum.NumberIsGreaterThanOrEqualTo
          ? `>= ${value}`
          : fractionType === FractionTypeEnum.NumberIsLessThan
            ? `< ${value}`
            : fractionType === FractionTypeEnum.NumberIsLessThanOrEqualTo
              ? `<= ${value}`
              : '';

    let mBrick =
      fractionType === FractionTypeEnum.NumberIsGreaterThan
        ? `f\`> ${value}\``
        : fractionType === FractionTypeEnum.NumberIsGreaterThanOrEqualTo
          ? `f\`>= ${value}\``
          : fractionType === FractionTypeEnum.NumberIsLessThan
            ? `f\`< ${value}\``
            : fractionType === FractionTypeEnum.NumberIsLessThanOrEqualTo
              ? `f\`<= ${value}\``
              : '';

    let newFraction: Fraction = {
      brick: isDefined(this.fraction.parentBrick) ? mBrick : sqlBrick,
      parentBrick: isDefined(this.fraction.parentBrick) ? mBrick : undefined,
      operator: this.fraction.operator,
      type: fractionType,
      numberValue1: Number(value)
    };

    return newFraction;
  }

  getChangedBetweenFraction(item: {
    fractionOperator: FractionOperatorEnum;
    fractionType: FractionTypeEnum;
    betweenOption: FractionNumberBetweenOptionEnum;
    n1: number;
    n2: number;
  }) {
    let { fractionOperator, fractionType, betweenOption, n1, n2 } = item;

    let sqlContent =
      betweenOption === FractionNumberBetweenOptionEnum.Inclusive
        ? `[${n1}, ${n2}]`
        : betweenOption === FractionNumberBetweenOptionEnum.LeftInclusive
          ? `[${n1}, ${n2})`
          : betweenOption === FractionNumberBetweenOptionEnum.RightInclusive
            ? `(${n1}, ${n2}]`
            : betweenOption === FractionNumberBetweenOptionEnum.Exclusive
              ? `(${n1}, ${n2})`
              : '';

    let sqlBrick =
      fractionType === FractionTypeEnum.NumberIsBetween
        ? sqlContent
        : fractionType === FractionTypeEnum.NumberIsNotBetween
          ? `not ${sqlContent}`
          : '';

    let mBrick =
      betweenOption === FractionNumberBetweenOptionEnum.Inclusive
        ? fractionType === FractionTypeEnum.NumberIsBetween
          ? `f\`[${n1} to ${n2}]\``
          : `f\`not [${n1} to ${n2}]\``
        : betweenOption === FractionNumberBetweenOptionEnum.LeftInclusive
          ? fractionType === FractionTypeEnum.NumberIsBetween
            ? `f\`[${n1} to ${n2})\``
            : `f\`not [${n1} to ${n2})\``
          : betweenOption === FractionNumberBetweenOptionEnum.RightInclusive
            ? fractionType === FractionTypeEnum.NumberIsBetween
              ? `f\`(${n1} to ${n2}]\``
              : `f\`not (${n1} to ${n2}]\``
            : betweenOption === FractionNumberBetweenOptionEnum.Exclusive
              ? fractionType === FractionTypeEnum.NumberIsBetween
                ? `f\`(${n1} to ${n2})\``
                : `f\`not (${n1} to ${n2})\``
              : '';

    let newFraction: Fraction = {
      brick: isDefined(this.fraction.parentBrick) ? mBrick : sqlBrick,
      parentBrick: isDefined(this.fraction.parentBrick) ? mBrick : undefined,
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
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `any`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsEqualTo: {
        let newNumberValues = this.defaultNumberValues;

        let mBrick = `f\`${newNumberValues}\``;

        this.fraction = {
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `${newNumberValues}`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `> ${newNumberValue1}`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `>= ${newNumberValue1}`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `< ${newNumberValue1}`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `<= ${newNumberValue1}`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `null`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.NumberIsBetween: {
        let newBetweenOption = FractionNumberBetweenOptionEnum.Inclusive;
        let newNumberValue1 = this.defaultNumberValue1;
        let newNumberValue2 = this.defaultNumberValue2;

        this.fraction = this.getChangedBetweenFraction({
          fractionOperator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not ${newNumberValues}`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.And,
          type: fractionType,
          numberValues: newNumberValues
        };

        this.updateControlNumberValuesFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.NumberIsNotBetween: {
        let newBetweenOption = FractionNumberBetweenOptionEnum.Inclusive;
        let newNumberValue1 = this.defaultNumberValue1;
        let newNumberValue2 = this.defaultNumberValue2;

        this.fraction = this.getChangedBetweenFraction({
          fractionOperator: FractionOperatorEnum.And,
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
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `not null`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.And,
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
