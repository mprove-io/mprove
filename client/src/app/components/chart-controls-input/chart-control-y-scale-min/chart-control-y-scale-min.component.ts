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
  selector: 'm-chart-control-y-scale-min',
  templateUrl: 'chart-control-y-scale-min.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlYScaleMinComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() yScaleMinChange = new EventEmitter();

  yScaleMin: AbstractControl;
  yScaleMinForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildYScaleMinForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildYScaleMinForm();
  }

  buildYScaleMinForm() {
    this.yScaleMinForm = this.fb.group({
      yScaleMin: [
        this.chart.y_scale_min,
        Validators.compose([services.ValidationService.numberValidator])
      ]
    });

    this.yScaleMin = this.yScaleMinForm.controls['yScaleMin'];

    this.yScaleMinChange.emit({
      yScaleMinValid: this.yScaleMinForm.valid
    });
  }

  yScaleMinBlur() {
    if (this.yScaleMin.value !== this.chart.y_scale_min) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        y_scale_min: this.yScaleMin.value
      });

      this.yScaleMinChange.emit({
        yScaleMinValid: this.yScaleMinForm.valid,
        chart: this.chart
      });
    }
  }
}
