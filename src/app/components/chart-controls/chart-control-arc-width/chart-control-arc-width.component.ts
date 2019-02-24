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
  selector: 'm-chart-control-arc-width',
  templateUrl: 'chart-control-arc-width.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlArcWidthComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() arcWidthChange = new EventEmitter();

  arcWidth: AbstractControl;
  arcWidthForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildArcWidthForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildArcWidthForm();
  }

  buildArcWidthForm() {
    this.arcWidthForm = this.fb.group({
      arcWidth: [
        this.chart.arc_width,
        Validators.compose([
          Validators.required,
          services.ValidationService.numberValidator,
          Validators.min(0)
        ])
      ]
    });

    this.arcWidth = this.arcWidthForm.controls['arcWidth'];

    this.arcWidthChange.emit({
      arcWidthValid: this.arcWidthForm.valid
    });
  }

  arcWidthBlur() {
    if (this.arcWidth.value !== this.chart.arc_width) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        arc_width: this.arcWidth.value
      });

      this.arcWidthChange.emit({
        arcWidthValid: this.arcWidthForm.valid,
        chart: this.chart
      });
    }
  }
}
