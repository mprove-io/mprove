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
  selector: 'm-chart-control-start-angle',
  templateUrl: 'chart-control-start-angle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlStartAngleComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() startAngleChange = new EventEmitter();

  startAngle: AbstractControl;
  startAngleForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildStartAngleForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildStartAngleForm();
  }

  buildStartAngleForm() {
    this.startAngleForm = this.fb.group({
      startAngle: [
        this.chart.start_angle,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator
        ])
      ]
    });

    this.startAngle = this.startAngleForm.controls['startAngle'];

    this.startAngleChange.emit({
      startAngleValid: this.startAngleForm.valid
    });
  }

  startAngleBlur() {
    if (this.startAngle.value !== this.chart.start_angle) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        start_angle: this.startAngle.value
      });

      this.startAngleChange.emit({
        startAngleValid: this.startAngleForm.valid,
        chart: this.chart
      });
    }
  }
}
