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
  selector: 'm-chart-control-min',
  templateUrl: 'chart-control-min.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlMinComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() minChange = new EventEmitter();

  min: AbstractControl;
  minForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildMinForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildMinForm();
  }

  buildMinForm() {
    this.minForm = this.fb.group({
      min: [
        this.chart.min,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator
        ])
      ]
    });

    this.min = this.minForm.controls['min'];

    this.minChange.emit({
      minValid: this.minForm.valid
    });
  }

  minBlur() {
    if (this.min.value !== this.chart.min) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        min: this.min.value
      });

      this.minChange.emit({
        minValid: this.minForm.valid,
        chart: this.chart
      });
    }
  }
}
