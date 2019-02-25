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
  selector: 'm-chart-control-view-height',
  templateUrl: 'chart-control-view-height.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlViewHeightComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() viewHeightChange = new EventEmitter();

  viewHeight: AbstractControl;
  viewHeightForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildViewHeightForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildViewHeightForm();
  }

  buildViewHeightForm() {
    this.viewHeightForm = this.fb.group({
      viewHeight: [
        this.chart.view_height,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.viewHeight = this.viewHeightForm.controls['viewHeight'];

    this.viewHeightChange.emit({
      viewHeightValid: this.viewHeightForm.valid
    });
  }

  viewHeightBlur() {
    if (this.viewHeight.value !== this.chart.view_height) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        view_height: this.viewHeight.value
      });

      this.viewHeightChange.emit({
        viewHeightValid: this.viewHeightForm.valid,
        chart: this.chart
      });
    }
  }
}
