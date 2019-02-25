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
  selector: 'm-chart-control-group-padding',
  templateUrl: 'chart-control-group-padding.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlGroupPaddingComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() groupPaddingChange = new EventEmitter();

  groupPadding: AbstractControl;
  groupPaddingForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildGroupPaddingForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildGroupPaddingForm();
  }

  buildGroupPaddingForm() {
    this.groupPaddingForm = this.fb.group({
      groupPadding: [
        this.chart.group_padding,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.groupPadding = this.groupPaddingForm.controls['groupPadding'];

    this.groupPaddingChange.emit({
      groupPaddingValid: this.groupPaddingForm.valid
    });
  }

  groupPaddingBlur() {
    if (this.groupPadding.value !== this.chart.group_padding) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        group_padding: this.groupPadding.value
      });

      this.groupPaddingChange.emit({
        groupPaddingValid: this.groupPaddingForm.valid,
        chart: this.chart
      });
    }
  }
}
