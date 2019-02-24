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
  selector: 'm-chart-control-title',
  templateUrl: 'chart-control-title.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlTitleComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() titleChange = new EventEmitter();

  title: AbstractControl;
  titleForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildTitleForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildTitleForm();
  }

  buildTitleForm() {
    this.titleForm = this.fb.group({
      title: [
        this.chart.title,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });

    this.title = this.titleForm.controls['title'];

    this.titleChange.emit({
      titleValid: this.titleForm.valid
    });
  }

  titleBlur() {
    if (this.title.value !== this.chart.title) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        title: this.title.value
      });

      this.titleChange.emit({
        titleValid: this.titleForm.valid,
        chart: this.chart
      });
    }
  }
}
