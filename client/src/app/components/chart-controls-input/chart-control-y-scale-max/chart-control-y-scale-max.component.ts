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
  selector: 'm-chart-control-y-scale-max',
  templateUrl: 'chart-control-y-scale-max.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlYScaleMaxComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() yScaleMaxChange = new EventEmitter();

  yScaleMax: AbstractControl;
  yScaleMaxForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildYScaleMaxForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildYScaleMaxForm();
  }

  buildYScaleMaxForm() {
    this.yScaleMaxForm = this.fb.group({
      yScaleMax: [
        this.chart.y_scale_max,
        Validators.compose([services.ValidationService.numberValidator])
      ]
    });

    this.yScaleMax = this.yScaleMaxForm.controls['yScaleMax'];

    this.yScaleMaxChange.emit({
      yScaleMaxValid: this.yScaleMaxForm.valid
    });
  }

  yScaleMaxBlur() {
    if (this.yScaleMax.value !== this.chart.y_scale_max) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        y_scale_max: this.yScaleMax.value
      });

      this.yScaleMaxChange.emit({
        yScaleMaxValid: this.yScaleMaxForm.valid,
        chart: this.chart
      });
    }
  }
}
