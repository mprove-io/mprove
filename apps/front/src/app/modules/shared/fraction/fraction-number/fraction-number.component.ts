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
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionNumberBetweenOption } from '#common/types/blockml/parts/fraction/fraction-number-between-option';
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';
import type { FractionType } from '#common/types/blockml/parts/fraction/fraction-type';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
import { ValidationService } from '#front/app/services/validation.service';
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
  readonly fractionOperatorAnd: FractionOperator = 'And';

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
      value: 'NumberIsAnyValue',
      operator: 'Or'
    },
    {
      label: 'is equal to',
      value: 'NumberIsEqualTo',
      operator: 'Or'
    },
    {
      label: 'is greater than',
      value: 'NumberIsGreaterThan',
      operator: 'Or'
    },
    {
      label: 'is greater than or equal to',
      value: 'NumberIsGreaterThanOrEqualTo',
      operator: 'Or'
    },
    {
      label: 'is less than',
      value: 'NumberIsLessThan',
      operator: 'Or'
    },
    {
      label: 'is less than or equal to',
      value: 'NumberIsLessThanOrEqualTo',
      operator: 'Or'
    },
    {
      label: 'is between',
      value: 'NumberIsBetween',
      operator: 'Or'
    },
    {
      label: 'is null',
      value: 'NumberIsNull',
      operator: 'Or'
    },
    {
      label: 'is not equal to',
      value: 'NumberIsNotEqualTo',
      operator: 'And'
    },
    {
      label: 'is not greater than',
      value: 'NumberIsNotGreaterThan',
      operator: 'And'
    },
    {
      label: 'is not greater than or equal to',
      value: 'NumberIsNotGreaterThanOrEqualTo',
      operator: 'And'
    },
    {
      label: 'is not less than',
      value: 'NumberIsNotLessThan',
      operator: 'And'
    },
    {
      label: 'is not less than or equal to',
      value: 'NumberIsNotLessThanOrEqualTo',
      operator: 'And'
    },
    {
      label: 'is not between',
      value: 'NumberIsNotBetween',
      operator: 'And'
    },
    {
      label: 'is not null',
      value: 'NumberIsNotNull',
      operator: 'And'
    }
  ];

  fractionNumberBetweenOptionsList: FractionNumberBetweenOptionItem[] = [
    {
      label: '[inclusive]',
      value: 'Inclusive'
    },
    {
      label: '[left inclusive)',
      value: 'LeftInclusive'
    },
    {
      label: '(right inclusive]',
      value: 'RightInclusive'
    },
    {
      label: '(exclusive)',
      value: 'Exclusive'
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

    let mBrick =
      fractionType === 'NumberIsEqualTo'
        ? `f\`${value}\``
        : fractionType === 'NumberIsNotEqualTo'
          ? `f\`not ${value}\``
          : '';

    let newFraction: Fraction = {
      brick: mBrick,
      parentBrick: mBrick,
      operator: this.fraction.operator,
      type: fractionType,
      numberValues: value
    };

    return newFraction;
  }

  getChangedSingleFraction(item: { value: number }) {
    let { value } = item;

    let fractionType = this.fraction.type;

    let mBrick =
      fractionType === 'NumberIsGreaterThan'
        ? `f\`> ${value}\``
        : fractionType === 'NumberIsNotGreaterThan'
          ? `f\`not > ${value}\``
          : fractionType === 'NumberIsGreaterThanOrEqualTo'
            ? `f\`>= ${value}\``
            : fractionType === 'NumberIsNotGreaterThanOrEqualTo'
              ? `f\`not >= ${value}\``
              : fractionType === 'NumberIsLessThan'
                ? `f\`< ${value}\``
                : fractionType === 'NumberIsNotLessThan'
                  ? `f\`not < ${value}\``
                  : fractionType === 'NumberIsLessThanOrEqualTo'
                    ? `f\`<= ${value}\``
                    : fractionType === 'NumberIsNotLessThanOrEqualTo'
                      ? `f\`not <= ${value}\``
                      : '';

    let newFraction: Fraction = {
      brick: mBrick,
      parentBrick: mBrick,
      operator: this.fraction.operator,
      type: fractionType,
      numberValue1: Number(value)
    };

    return newFraction;
  }

  getChangedBetweenFraction(item: {
    fractionOperator: FractionOperator;
    fractionType: FractionType;
    betweenOption: FractionNumberBetweenOption;
    n1: number;
    n2: number;
  }) {
    let { fractionOperator, fractionType, betweenOption, n1, n2 } = item;

    let mBrick =
      betweenOption === 'Inclusive'
        ? fractionType === 'NumberIsBetween'
          ? `f\`[${n1} to ${n2}]\``
          : `f\`not [${n1} to ${n2}]\``
        : betweenOption === 'LeftInclusive'
          ? fractionType === 'NumberIsBetween'
            ? `f\`[${n1} to ${n2})\``
            : `f\`not [${n1} to ${n2})\``
          : betweenOption === 'RightInclusive'
            ? fractionType === 'NumberIsBetween'
              ? `f\`(${n1} to ${n2}]\``
              : `f\`not (${n1} to ${n2}]\``
            : betweenOption === 'Exclusive'
              ? fractionType === 'NumberIsBetween'
                ? `f\`(${n1} to ${n2})\``
                : `f\`not (${n1} to ${n2})\``
              : '';

    let newFraction: Fraction = {
      brick: mBrick,
      parentBrick: mBrick,
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
      case 'NumberIsAnyValue': {
        let mBrick = MALLOY_FILTER_ANY;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsEqualTo': {
        let newNumberValues = this.defaultNumberValues;

        let mBrick = `f\`${newNumberValues}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          numberValues: newNumberValues
        };

        this.updateControlNumberValuesFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsGreaterThan': {
        let newNumberValue1 = this.defaultNumberValue1;

        let mBrick = `f\`> ${newNumberValue1}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsNotGreaterThan': {
        let newNumberValue1 = this.defaultNumberValue1;

        let mBrick = `f\`not > ${newNumberValue1}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsGreaterThanOrEqualTo': {
        let newNumberValue1 = this.defaultNumberValue1;

        let mBrick = `f\`>= ${newNumberValue1}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsNotGreaterThanOrEqualTo': {
        let newNumberValue1 = this.defaultNumberValue1;

        let mBrick = `f\`not >= ${newNumberValue1}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsLessThan': {
        let newNumberValue1 = this.defaultNumberValue1;

        let mBrick = `f\`< ${newNumberValue1}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsNotLessThan': {
        let newNumberValue1 = this.defaultNumberValue1;

        let mBrick = `f\`not < ${newNumberValue1}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsLessThanOrEqualTo': {
        let newNumberValue1 = this.defaultNumberValue1;

        let mBrick = `f\`<= ${newNumberValue1}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsNotLessThanOrEqualTo': {
        let newNumberValue1 = this.defaultNumberValue1;

        let mBrick = `f\`not <= ${newNumberValue1}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          numberValue1: newNumberValue1
        };

        this.updateControlSingleValueFormNumberValue1FromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsNull': {
        let mBrick = 'f`null`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case 'NumberIsBetween': {
        let newBetweenOption: FractionNumberBetweenOption = 'Inclusive';
        let newNumberValue1 = this.defaultNumberValue1;
        let newNumberValue2 = this.defaultNumberValue2;

        this.fraction = this.getChangedBetweenFraction({
          fractionOperator: 'Or',
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

      case 'NumberIsNotEqualTo': {
        let newNumberValues = this.defaultNumberValues;

        let mBrick = `f\`not ${newNumberValues}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType,
          numberValues: newNumberValues
        };

        this.updateControlNumberValuesFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case 'NumberIsNotBetween': {
        let newBetweenOption: FractionNumberBetweenOption = 'Inclusive';
        let newNumberValue1 = this.defaultNumberValue1;
        let newNumberValue2 = this.defaultNumberValue2;

        this.fraction = this.getChangedBetweenFraction({
          fractionOperator: 'And',
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

      case 'NumberIsNotNull': {
        let mBrick = 'f`not null`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
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
