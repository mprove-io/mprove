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
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';
import { ValidationService } from '~front/app/services/validation.service';
import { FractionTypeItem } from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-day-of-week-index',
  templateUrl: 'fraction-day-of-week-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionDayOfWeekIndexComponent implements OnInit {
  @ViewChild('fractionDayOfWeekIndexTypeSelect', { static: false })
  fractionDayOfWeekIndexTypeSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionDayOfWeekIndexTypeSelectElement?.close();
  }

  defaultDayOfWeekIndexValues = '1, 2, 3';

  fractionOperatorEnum = FractionOperatorEnum;
  fractionTypeEnum = FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  dayOfWeekIndexValuesForm: FormGroup;

  fractionDayOfWeekIndexTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: FractionTypeEnum.DayOfWeekIndexIsAnyValue,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is equal to',
      value: FractionTypeEnum.DayOfWeekIndexIsEqualTo,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: FractionTypeEnum.DayOfWeekIndexIsNull,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is not equal to',
      value: FractionTypeEnum.DayOfWeekIndexIsNotEqualTo,
      operator: FractionOperatorEnum.And
    },
    {
      label: 'is not null',
      value: FractionTypeEnum.DayOfWeekIndexIsNotNull,
      operator: FractionOperatorEnum.And
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildDayOfWeekIndexValuesForm();
  }

  buildDayOfWeekIndexValuesForm() {
    this.dayOfWeekIndexValuesForm = this.fb.group({
      dayOfWeekIndexValues: [
        this.fraction.dayOfWeekIndexValues,
        [
          Validators.required,
          ValidationService.dayOfWeekIndexValuesValidator,
          Validators.maxLength(255)
        ]
      ]
    });
  }

  updateControlDayOfWeekIndexValuesFromFraction() {
    this.dayOfWeekIndexValuesForm.controls['dayOfWeekIndexValues'].setValue(
      this.fraction.dayOfWeekIndexValues
    );
  }

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    switch (fractionType) {
      case this.fractionTypeEnum.DayOfWeekIndexIsAnyValue: {
        this.fraction = {
          brick: `any`,
          parentBrick: `any`,
          operator: FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsEqualTo: {
        let dayOfWeekIndexValues = this.defaultDayOfWeekIndexValues;

        this.fraction = {
          brick: `${dayOfWeekIndexValues}`,
          parentBrick: `${dayOfWeekIndexValues}`,
          operator: FractionOperatorEnum.Or,
          type: fractionType,
          dayOfWeekIndexValues: dayOfWeekIndexValues
        };

        this.updateControlDayOfWeekIndexValuesFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsNull: {
        this.fraction = {
          brick: `null`,
          parentBrick: `null`,
          operator: FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsNotEqualTo: {
        let dayOfWeekIndexValues = this.defaultDayOfWeekIndexValues;

        this.fraction = {
          brick: `not ${dayOfWeekIndexValues}`,
          parentBrick: `not ${dayOfWeekIndexValues}`,
          operator: FractionOperatorEnum.And,
          type: fractionType,
          dayOfWeekIndexValues: dayOfWeekIndexValues
        };

        this.updateControlDayOfWeekIndexValuesFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.DayOfWeekIndexIsNotNull: {
        this.fraction = {
          brick: `not null`,
          parentBrick: `not null`,
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

  getDayOfWeekIndexBrick(fractionType: FractionTypeEnum, value: string) {
    let newBrick =
      fractionType === FractionTypeEnum.DayOfWeekIndexIsEqualTo
        ? value
        : fractionType === FractionTypeEnum.DayOfWeekIndexIsNotEqualTo
          ? `not ${value}`
          : '';

    return newBrick;
  }

  dayOfWeekIndexValuesBlur() {
    let value =
      this.dayOfWeekIndexValuesForm.controls['dayOfWeekIndexValues'].value;

    if (value !== this.fraction.dayOfWeekIndexValues) {
      let newBrick = this.getDayOfWeekIndexBrick(this.fraction.type, value);

      this.fraction = {
        brick: newBrick,
        parentBrick: newBrick,
        operator: this.fraction.operator,
        type: this.fraction.type,
        dayOfWeekIndexValues: value
      };

      if (this.dayOfWeekIndexValuesForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }
}
