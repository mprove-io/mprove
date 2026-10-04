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
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionType } from '#common/types/blockml/parts/fraction/fraction-type';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
import { ValidationService } from '#front/app/services/validation.service';
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

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  dayOfWeekIndexValuesForm: FormGroup;

  fractionDayOfWeekIndexTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: 'DayOfWeekIndexIsAnyValue',
      operator: 'Or'
    },
    {
      label: 'is equal to',
      value: 'DayOfWeekIndexIsEqualTo',
      operator: 'Or'
    },
    {
      label: 'is null',
      value: 'DayOfWeekIndexIsNull',
      operator: 'Or'
    },
    {
      label: 'is not equal to',
      value: 'DayOfWeekIndexIsNotEqualTo',
      operator: 'And'
    },
    {
      label: 'is not null',
      value: 'DayOfWeekIndexIsNotNull',
      operator: 'And'
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
      case 'DayOfWeekIndexIsAnyValue': {
        this.fraction = {
          brick: `any`,
          parentBrick: `any`,
          operator: 'Or',
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case 'DayOfWeekIndexIsEqualTo': {
        let dayOfWeekIndexValues = this.defaultDayOfWeekIndexValues;

        this.fraction = {
          brick: `${dayOfWeekIndexValues}`,
          parentBrick: `${dayOfWeekIndexValues}`,
          operator: 'Or',
          type: fractionType,
          dayOfWeekIndexValues: dayOfWeekIndexValues
        };

        this.updateControlDayOfWeekIndexValuesFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'DayOfWeekIndexIsNull': {
        this.fraction = {
          brick: `null`,
          parentBrick: `null`,
          operator: 'Or',
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case 'DayOfWeekIndexIsNotEqualTo': {
        let dayOfWeekIndexValues = this.defaultDayOfWeekIndexValues;

        this.fraction = {
          brick: `not ${dayOfWeekIndexValues}`,
          parentBrick: `not ${dayOfWeekIndexValues}`,
          operator: 'And',
          type: fractionType,
          dayOfWeekIndexValues: dayOfWeekIndexValues
        };

        this.updateControlDayOfWeekIndexValuesFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case 'DayOfWeekIndexIsNotNull': {
        this.fraction = {
          brick: `not null`,
          parentBrick: `not null`,
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

  getDayOfWeekIndexBrick(fractionType: FractionType, value: string) {
    let newBrick =
      fractionType === 'DayOfWeekIndexIsEqualTo'
        ? value
        : fractionType === 'DayOfWeekIndexIsNotEqualTo'
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
