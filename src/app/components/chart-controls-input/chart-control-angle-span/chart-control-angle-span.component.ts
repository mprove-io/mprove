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
  selector: 'm-chart-control-angle-span',
  templateUrl: 'chart-control-angle-span.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlAngleSpanComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() angleSpanChange = new EventEmitter();

  angleSpan: AbstractControl;
  angleSpanForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildAngleSpanForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildAngleSpanForm();
  }

  buildAngleSpanForm() {
    this.angleSpanForm = this.fb.group({
      angleSpan: [
        this.chart.angle_span,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.angleSpan = this.angleSpanForm.controls['angleSpan'];

    this.angleSpanChange.emit({
      angleSpanValid: this.angleSpanForm.valid
    });
  }

  angleSpanBlur() {
    if (this.angleSpan.value !== this.chart.angle_span) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        angle_span: this.angleSpan.value
      });

      this.angleSpanChange.emit({
        angleSpanValid: this.angleSpanForm.valid,
        chart: this.chart
      });
    }
  }
}
