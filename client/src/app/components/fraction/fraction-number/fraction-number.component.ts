import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import * as api from '@app/api/_index';
import { ValidationService } from '@app/services/validation.service';

@Component({
  moduleId: module.id,
  selector: 'm-fraction-number',
  templateUrl: 'fraction-number.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionNumberComponent implements OnInit {
  fractionTypeEnum = api.FractionTypeEnum;
  fractionOperatorEnum = api.FractionOperatorEnum;
  fractionNumberBetweenOptionEnum = api.FractionNumberBetweenOptionEnum;

  @Input() fraction: api.Fraction;
  @Input() isFirst: boolean;

  @Output() fractionChange = new EventEmitter();

  numberValuesForm: FormGroup;

  numberSingleValueForm: FormGroup;

  numberBetweenForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildNumberValuesForm();
    this.buildNumberSingleValueForm();
    this.buildNumberBetweenForm();
  }

  getValueBrick(fractionType: api.FractionTypeEnum, value: string) {
    let newBrick =
      fractionType === api.FractionTypeEnum.NumberIsEqualTo
        ? value
        : fractionType === api.FractionTypeEnum.NumberIsNotEqualTo
        ? `not ${value}`
        : '';

    return newBrick;
  }

  getSingleBrick(fractionType: api.FractionTypeEnum, value: number) {
    let newBrick =
      fractionType === api.FractionTypeEnum.NumberIsGreaterThan
        ? `> ${value}`
        : fractionType === api.FractionTypeEnum.NumberIsGreaterThanOrEqualTo
        ? `>= ${value}`
        : fractionType === api.FractionTypeEnum.NumberIsLessThan
        ? `< ${value}`
        : fractionType === api.FractionTypeEnum.NumberIsLessThanOrEqualTo
        ? `<= ${value}`
        : '';

    return newBrick;
  }

  getBetweenBrick(
    fractionType: api.FractionTypeEnum,
    option: api.FractionNumberBetweenOptionEnum,
    n1: number,
    n2: number
  ) {
    let content =
      option === api.FractionNumberBetweenOptionEnum.Inclusive
        ? `[${n1}, ${n2}]`
        : option === api.FractionNumberBetweenOptionEnum.LeftInclusive
        ? `[${n1}, ${n2})`
        : option === api.FractionNumberBetweenOptionEnum.RightInclusive
        ? `(${n1}, ${n2}]`
        : option === api.FractionNumberBetweenOptionEnum.Exclusive
        ? `(${n1}, ${n2})`
        : '';

    let newBrick =
      fractionType === api.FractionTypeEnum.NumberIsBetween
        ? content
        : fractionType === api.FractionTypeEnum.NumberIsNotBetween
        ? `not ${content}`
        : '';

    return newBrick;
  }

  buildNumberValuesForm() {
    this.numberValuesForm = this.fb.group({
      numberValues: [
        this.fraction.number_values,
        Validators.compose([
          Validators.required,
          ValidationService.numberValuesValidator,
          Validators.maxLength(255)
        ])
      ]
    });
  }

  buildNumberSingleValueForm() {
    this.numberSingleValueForm = this.fb.group({
      numberSingleValue: [
        this.fraction.number_value1,
        Validators.compose([
          Validators.required,
          ValidationService.numberValidator,
          Validators.maxLength(255)
        ])
      ]
    });
  }

  buildNumberBetweenForm() {
    this.numberBetweenForm = this.fb.group({
      numberBetweenFirstValue: [
        this.fraction.number_value1,
        Validators.compose([
          Validators.required,
          ValidationService.numberValidator,
          Validators.maxLength(255)
        ])
      ],
      numberBetweenSecondValue: [
        this.fraction.number_value2,
        Validators.compose([
          Validators.required,
          ValidationService.numberValidator,
          Validators.maxLength(255)
        ])
      ]
    });
  }

  typeChange(ev: MatSelectChange) {
    switch (ev.value) {
      case this.fractionTypeEnum.NumberIsAnyValue: {
        this.fraction = {
          brick: `any`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.NumberIsEqualTo: {
        this.fraction = {
          brick: `${this.fraction.number_values}`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          number_values: this.fraction.number_values
        };

        if (this.numberValuesForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.NumberIsGreaterThan: {
        this.fraction = {
          brick: `> ${this.fraction.number_value1 || ''}`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          number_value1: this.fraction.number_value1
        };

        if (this.numberSingleValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.NumberIsGreaterThanOrEqualTo: {
        this.fraction = {
          brick: `>= ${this.fraction.number_value1 || ''}`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          number_value1: this.fraction.number_value1
        };

        if (this.numberSingleValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.NumberIsLessThan: {
        this.fraction = {
          brick: `< ${this.fraction.number_value1 || ''}`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          number_value1: this.fraction.number_value1
        };

        if (this.numberSingleValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.NumberIsLessThanOrEqualTo: {
        this.fraction = {
          brick: `<= ${this.fraction.number_value1 || ''}`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          number_value1: this.fraction.number_value1
        };

        if (this.numberSingleValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.NumberIsNull: {
        this.fraction = {
          brick: `null`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.NumberIsBetween: {
        let newBetweenOption =
          this.fraction.number_between_option ||
          api.FractionNumberBetweenOptionEnum.Inclusive;

        let newBrick = this.getBetweenBrick(
          ev.value,
          newBetweenOption,
          this.fraction.number_value1,
          this.fraction.number_value2
        );

        this.fraction = {
          brick: newBrick,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          number_between_option: newBetweenOption,
          number_value1: this.fraction.number_value1,
          number_value2: this.fraction.number_value2
        };

        if (this.numberBetweenForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.NumberIsNotEqualTo: {
        this.fraction = {
          brick: `not ${this.fraction.number_values}`,
          operator: api.FractionOperatorEnum.And,
          type: ev.value,
          number_values: this.fraction.number_values
        };

        if (this.numberValuesForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.NumberIsNotBetween: {
        let newBetweenOption =
          this.fraction.number_between_option ||
          api.FractionNumberBetweenOptionEnum.Inclusive;

        let newBrick = this.getBetweenBrick(
          ev.value,
          newBetweenOption,
          this.fraction.number_value1,
          this.fraction.number_value2
        );

        this.fraction = {
          brick: newBrick,
          operator: api.FractionOperatorEnum.And,
          type: ev.value,
          number_between_option: newBetweenOption,
          number_value1: this.fraction.number_value1,
          number_value2: this.fraction.number_value2
        };

        if (this.numberBetweenForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.NumberIsNotNull: {
        this.fraction = {
          brick: `not null`,
          operator: api.FractionOperatorEnum.And,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      default: {
      }
    }
  }

  betweenOptionChange(ev: MatSelectChange) {
    let newBetweenOption = ev.value;

    let newBrick = this.getBetweenBrick(
      this.fraction.type,
      newBetweenOption,
      this.fraction.number_value1,
      this.fraction.number_value2
    );

    this.fraction = {
      brick: newBrick,
      operator: this.fraction.operator,
      type: this.fraction.type,
      number_between_option: newBetweenOption,
      number_value1: this.fraction.number_value1,
      number_value2: this.fraction.number_value2
    };

    if (this.numberBetweenForm.valid) {
      this.emitFractionChange();
    }
  }

  numberValuesBlur(numberValues: FormControl) {
    if (numberValues.value !== this.fraction.number_values) {
      let newBrick = this.getValueBrick(this.fraction.type, numberValues.value);

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        number_values: numberValues.value
      };

      if (this.numberValuesForm.valid) {
        this.emitFractionChange();
      }
    }
  }

  numberSingleValueBlur(numberSingleValue: FormControl) {
    if (numberSingleValue.value !== this.fraction.number_value1) {
      let newBrick = this.getSingleBrick(
        this.fraction.type,
        numberSingleValue.value
      );

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        number_value1: numberSingleValue.value
      };

      if (this.numberSingleValueForm.valid) {
        this.emitFractionChange();
      }
    }
  }

  numberBetweenFirstValueBlur(numberBetweenFirstValue: FormControl) {
    if (numberBetweenFirstValue.value !== this.fraction.number_value1) {
      let newBrick = this.getBetweenBrick(
        this.fraction.type,
        this.fraction.number_between_option,
        numberBetweenFirstValue.value,
        this.fraction.number_value2
      );

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        number_between_option: this.fraction.number_between_option,
        number_value1: numberBetweenFirstValue.value,
        number_value2: this.fraction.number_value2
      };

      if (this.numberBetweenForm.valid) {
        this.emitFractionChange();
      }
    }
  }

  numberBetweenSecondValueBlur(numberBetweenSecondValue: FormControl) {
    if (numberBetweenSecondValue.value !== this.fraction.number_value2) {
      let newBrick = this.getBetweenBrick(
        this.fraction.type,
        this.fraction.number_between_option,
        this.fraction.number_value1,
        numberBetweenSecondValue.value
      );

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        number_between_option: this.fraction.number_between_option,
        number_value1: this.fraction.number_value1,
        number_value2: numberBetweenSecondValue.value
      };

      if (this.numberBetweenForm.valid) {
        this.emitFractionChange();
      }
    }
  }

  emitFractionChange() {
    this.fractionChange.emit(this.fraction);
  }
}
