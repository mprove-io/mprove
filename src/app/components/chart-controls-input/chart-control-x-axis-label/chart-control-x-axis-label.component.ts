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
  selector: 'm-chart-control-x-axis-label',
  templateUrl: 'chart-control-x-axis-label.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlXAxisLabelComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() xAxisLabelChange = new EventEmitter();

  xAxisLabel: AbstractControl;
  xAxisLabelForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildXAxisLabelForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildXAxisLabelForm();
  }

  buildXAxisLabelForm() {
    this.xAxisLabelForm = this.fb.group({
      xAxisLabel: [
        this.chart.x_axis_label,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });

    this.xAxisLabel = this.xAxisLabelForm.controls['xAxisLabel'];

    this.xAxisLabelChange.emit({
      xAxisLabelValid: this.xAxisLabelForm.valid
    });
  }

  xAxisLabelBlur() {
    if (this.xAxisLabel.value !== this.chart.x_axis_label) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        x_axis_label: this.xAxisLabel.value
      });

      this.xAxisLabelChange.emit({
        xAxisLabelValid: this.xAxisLabelForm.valid,
        chart: this.chart
      });
    }
  }
}
