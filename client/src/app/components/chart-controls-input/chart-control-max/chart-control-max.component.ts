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
  selector: 'm-chart-control-max',
  templateUrl: 'chart-control-max.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlMaxComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() maxChange = new EventEmitter();

  max: AbstractControl;
  maxForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildMaxForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildMaxForm();
  }

  buildMaxForm() {
    this.maxForm = this.fb.group({
      max: [
        this.chart.max,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator
        ])
      ]
    });

    this.max = this.maxForm.controls['max'];

    this.maxChange.emit({
      maxValid: this.maxForm.valid
    });
  }

  maxBlur() {
    if (this.max.value !== this.chart.max) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        max: this.max.value
      });

      this.maxChange.emit({
        maxValid: this.maxForm.valid,
        chart: this.chart
      });
    }
  }
}
