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
  selector: 'm-chart-control-bar-padding',
  templateUrl: 'chart-control-bar-padding.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlBarPaddingComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() barPaddingChange = new EventEmitter();

  barPadding: AbstractControl;
  barPaddingForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildBarPaddingForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildBarPaddingForm();
  }

  buildBarPaddingForm() {
    this.barPaddingForm = this.fb.group({
      barPadding: [
        this.chart.bar_padding,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.barPadding = this.barPaddingForm.controls['barPadding'];

    this.barPaddingChange.emit({
      barPaddingValid: this.barPaddingForm.valid
    });
  }

  barPaddingBlur() {
    if (this.barPadding.value !== this.chart.bar_padding) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        bar_padding: this.barPadding.value
      });

      this.barPaddingChange.emit({
        barPaddingValid: this.barPaddingForm.valid,
        chart: this.chart
      });
    }
  }
}
