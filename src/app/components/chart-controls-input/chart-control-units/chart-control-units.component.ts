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
  selector: 'm-chart-control-units',
  templateUrl: 'chart-control-units.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlUnitsComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() unitsChange = new EventEmitter();

  units: AbstractControl;
  unitsForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildUnitsForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildUnitsForm();
  }

  buildUnitsForm() {
    this.unitsForm = this.fb.group({
      units: [
        this.chart.units,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });

    this.units = this.unitsForm.controls['units'];

    this.unitsChange.emit({
      unitsValid: this.unitsForm.valid
    });
  }

  unitsBlur() {
    if (this.units.value !== this.chart.units) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        units: this.units.value
      });

      this.unitsChange.emit({
        unitsValid: this.unitsForm.valid,
        chart: this.chart
      });
    }
  }
}
