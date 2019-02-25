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
  selector: 'm-chart-control-small-segments',
  templateUrl: 'chart-control-small-segments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSmallSegmentsComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() smallSegmentsChange = new EventEmitter();

  smallSegments: AbstractControl;
  smallSegmentsForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildSmallSegmentsForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildSmallSegmentsForm();
  }

  buildSmallSegmentsForm() {
    this.smallSegmentsForm = this.fb.group({
      smallSegments: [
        this.chart.small_segments,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.smallSegments = this.smallSegmentsForm.controls['smallSegments'];

    this.smallSegmentsChange.emit({
      smallSegmentsValid: this.smallSegmentsForm.valid
    });
  }

  smallSegmentsBlur() {
    if (this.smallSegments.value !== this.chart.small_segments) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        small_segments: this.smallSegments.value
      });

      this.smallSegmentsChange.emit({
        smallSegmentsValid: this.smallSegmentsForm.valid,
        chart: this.chart
      });
    }
  }
}
