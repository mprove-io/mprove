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
  selector: 'm-chart-control-view-width',
  templateUrl: 'chart-control-view-width.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlViewWidthComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() viewWidthChange = new EventEmitter();

  viewWidth: AbstractControl;
  viewWidthForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildViewWidthForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildViewWidthForm();
  }

  buildViewWidthForm() {
    this.viewWidthForm = this.fb.group({
      viewWidth: [
        this.chart.view_width,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.viewWidth = this.viewWidthForm.controls['viewWidth'];

    this.viewWidthChange.emit({
      viewWidthValid: this.viewWidthForm.valid
    });
  }

  viewWidthBlur() {
    if (this.viewWidth.value !== this.chart.view_width) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        view_width: this.viewWidth.value
      });

      this.viewWidthChange.emit({
        viewWidthValid: this.viewWidthForm.valid,
        chart: this.chart
      });
    }
  }
}
