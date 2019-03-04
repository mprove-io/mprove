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
  selector: 'm-chart-control-y-axis-label',
  templateUrl: 'chart-control-y-axis-label.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlYAxisLabelComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() yAxisLabelChange = new EventEmitter();

  yAxisLabel: AbstractControl;
  yAxisLabelForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildYAxisLabelForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildYAxisLabelForm();
  }

  buildYAxisLabelForm() {
    this.yAxisLabelForm = this.fb.group({
      yAxisLabel: [
        this.chart.y_axis_label,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });

    this.yAxisLabel = this.yAxisLabelForm.controls['yAxisLabel'];

    this.yAxisLabelChange.emit({
      yAxisLabelValid: this.yAxisLabelForm.valid
    });
  }

  yAxisLabelBlur() {
    if (this.yAxisLabel.value !== this.chart.y_axis_label) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        y_axis_label: this.yAxisLabel.value
      });

      this.yAxisLabelChange.emit({
        yAxisLabelValid: this.yAxisLabelForm.valid,
        chart: this.chart
      });
    }
  }
}
