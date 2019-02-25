import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormGroup,
  AbstractControl,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import * as services from '@app/services/_index';
import * as api from '@app/api/_index';
import * as uuid from 'uuid';

import { ErrorStateMatcher } from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'm-chart-control-inner-padding',
  templateUrl: 'chart-control-inner-padding.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlInnerPaddingComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() innerPaddingChange = new EventEmitter();

  innerPadding: AbstractControl;
  innerPaddingForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildInnerPaddingForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildInnerPaddingForm();
  }

  buildInnerPaddingForm() {
    this.innerPaddingForm = this.fb.group({
      innerPadding: [
        this.chart.inner_padding,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.innerPadding = this.innerPaddingForm.controls['innerPadding'];

    this.innerPaddingChange.emit({
      innerPaddingValid: this.innerPaddingForm.valid
    });
  }

  innerPaddingBlur() {
    if (this.innerPadding.value !== this.chart.inner_padding) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        inner_padding: this.innerPadding.value
      });

      this.innerPaddingChange.emit({
        innerPaddingValid: this.innerPaddingForm.valid,
        chart: this.chart
      });
    }
  }
}
