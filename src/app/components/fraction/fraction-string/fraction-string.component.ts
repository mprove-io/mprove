import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import * as api from 'app/api/_index';

@Component({
  moduleId: module.id,
  selector: 'm-fraction-string',
  templateUrl: 'fraction-string.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionStringComponent implements OnInit {
  fractionTypeEnum = api.FractionTypeEnum;
  fractionOperatorEnum = api.FractionOperatorEnum;

  @Input() fraction: api.Fraction;
  @Input() isFirst: boolean;

  @Output() fractionChange = new EventEmitter();

  stringValueForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildStringValueForm();
  }

  getValueBrick(fractionType: api.FractionTypeEnum, value: string) {
    let newBrick =
      fractionType === api.FractionTypeEnum.StringIsEqualTo
        ? `-${value}-`
        : fractionType === api.FractionTypeEnum.StringContains
        ? `%${value}%`
        : fractionType === api.FractionTypeEnum.StringStartsWith
        ? `${value}%`
        : fractionType === api.FractionTypeEnum.StringEndsWith
        ? `%${value}`
        : fractionType === api.FractionTypeEnum.StringIsNotEqualTo
        ? `not -${value}-`
        : fractionType === api.FractionTypeEnum.StringDoesNotContain
        ? `not %${value}%`
        : fractionType === api.FractionTypeEnum.StringDoesNotStartWith
        ? `${value}% not`
        : fractionType === api.FractionTypeEnum.StringDoesNotEndWith
        ? `not %${value}`
        : '';

    return newBrick;
  }

  buildStringValueForm() {
    this.stringValueForm = this.fb.group({
      stringValue: [
        this.fraction.string_value,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });
  }

  typeChange(ev: MatSelectChange) {
    switch (ev.value) {
      case this.fractionTypeEnum.StringIsAnyValue: {
        this.fraction = {
          brick: `any`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.StringIsEqualTo: {
        this.fraction = {
          brick: `-${this.fraction.string_value}-`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          string_value: this.fraction.string_value
        };

        if (this.stringValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.StringContains: {
        this.fraction = {
          brick: `%${this.fraction.string_value}%`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          string_value: this.fraction.string_value
        };

        if (this.stringValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.StringStartsWith: {
        this.fraction = {
          brick: `${this.fraction.string_value}%`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          string_value: this.fraction.string_value
        };

        if (this.stringValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.StringEndsWith: {
        this.fraction = {
          brick: `%${this.fraction.string_value}`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value,
          string_value: this.fraction.string_value
        };

        if (this.stringValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.StringIsNull: {
        this.fraction = {
          brick: `null`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.StringIsBlank: {
        this.fraction = {
          brick: `blank`,
          operator: api.FractionOperatorEnum.Or,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.StringIsNotEqualTo: {
        this.fraction = {
          brick: `not -${this.fraction.string_value}-`,
          operator: api.FractionOperatorEnum.And,
          type: ev.value,
          string_value: this.fraction.string_value
        };

        if (this.stringValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.StringDoesNotContain: {
        this.fraction = {
          brick: `not %${this.fraction.string_value}%`,
          operator: api.FractionOperatorEnum.And,
          type: ev.value,
          string_value: this.fraction.string_value
        };

        if (this.stringValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.StringDoesNotStartWith: {
        this.fraction = {
          brick: `${this.fraction.string_value}% not`,
          operator: api.FractionOperatorEnum.And,
          type: ev.value,
          string_value: this.fraction.string_value
        };

        if (this.stringValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.StringDoesNotEndWith: {
        this.fraction = {
          brick: `not %${this.fraction.string_value}`,
          operator: api.FractionOperatorEnum.And,
          type: ev.value,
          string_value: this.fraction.string_value
        };

        if (this.stringValueForm.valid) {
          this.emitFractionChange();
        }

        break;
      }

      case this.fractionTypeEnum.StringIsNotNull: {
        this.fraction = {
          brick: `not null`,
          operator: api.FractionOperatorEnum.And,
          type: ev.value
        };

        this.emitFractionChange();
        break;
      }

      case this.fractionTypeEnum.StringIsNotBlank: {
        this.fraction = {
          brick: `not blank`,
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

  stringValueBlur(value: string) {
    if (value !== this.fraction.string_value) {
      let newBrick = this.getValueBrick(this.fraction.type, value);

      this.fraction = {
        brick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        string_value: value
      };

      if (this.stringValueForm.valid) {
        this.emitFractionChange();
      }
    }
  }

  emitFractionChange() {
    this.fractionChange.emit(this.fraction);
  }
}
