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
  selector: 'm-chart-control-legend-title',
  templateUrl: 'chart-control-legend-title.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlLegendTitleComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() legendTitleChange = new EventEmitter();

  legendTitle: AbstractControl;
  legendTitleForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildLegendTitleForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildLegendTitleForm();
  }

  buildLegendTitleForm() {
    this.legendTitleForm = this.fb.group({
      legendTitle: [
        this.chart.legend_title,
        Validators.compose([
          // Validators.required,
          Validators.maxLength(255)
        ])
      ]
    });

    this.legendTitle = this.legendTitleForm.controls['legendTitle'];

    this.legendTitleChange.emit({
      legendTitleValid: this.legendTitleForm.valid
    });
  }

  legendTitleBlur() {
    if (this.legendTitle.value !== this.chart.legend_title) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        legend_title: this.legendTitle.value
      });

      this.legendTitleChange.emit({
        legendTitleValid: this.legendTitleForm.valid,
        chart: this.chart
      });
    }
  }
}
