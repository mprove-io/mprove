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
  selector: 'm-chart-control-x-scale-max',
  templateUrl: 'chart-control-x-scale-max.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlXScaleMaxComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() xScaleMaxChange = new EventEmitter();

  xScaleMax: AbstractControl;
  xScaleMaxForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildXScaleMaxForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildXScaleMaxForm();
  }

  buildXScaleMaxForm() {
    this.xScaleMaxForm = this.fb.group({
      xScaleMax: [
        this.chart.x_scale_max,
        Validators.compose([services.ValidationService.numberValidator])
      ]
    });

    this.xScaleMax = this.xScaleMaxForm.controls['xScaleMax'];

    this.xScaleMaxChange.emit({
      xScaleMaxValid: this.xScaleMaxForm.valid
    });
  }

  xScaleMaxBlur() {
    if (this.xScaleMax.value !== this.chart.x_scale_max) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        x_scale_max: this.xScaleMax.value
      });

      this.xScaleMaxChange.emit({
        xScaleMaxValid: this.xScaleMaxForm.valid,
        chart: this.chart
      });
    }
  }
}
