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
  selector: 'm-chart-control-big-segments',
  templateUrl: 'chart-control-big-segments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlBigSegmentsComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() bigSegmentsChange = new EventEmitter();

  bigSegments: AbstractControl;
  bigSegmentsForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildBigSegmentsForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildBigSegmentsForm();
  }

  buildBigSegmentsForm() {
    this.bigSegmentsForm = this.fb.group({
      bigSegments: [
        this.chart.big_segments,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.bigSegments = this.bigSegmentsForm.controls['bigSegments'];

    this.bigSegmentsChange.emit({
      bigSegmentsValid: this.bigSegmentsForm.valid
    });
  }

  bigSegmentsBlur() {
    if (this.bigSegments.value !== this.chart.big_segments) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        big_segments: this.bigSegments.value
      });

      this.bigSegmentsChange.emit({
        bigSegmentsValid: this.bigSegmentsForm.valid,
        chart: this.chart
      });
    }
  }
}
