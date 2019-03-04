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
  selector: 'm-chart-control-page-size',
  templateUrl: 'chart-control-page-size.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlPageSizeComponent implements OnInit, OnChanges {
  @Input() chart: api.Chart;
  @Output() pageSizeChange = new EventEmitter();

  pageSize: AbstractControl;
  pageSizeForm: FormGroup;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      control ? control.invalid : false
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildPageSizeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildPageSizeForm();
  }

  buildPageSizeForm() {
    this.pageSizeForm = this.fb.group({
      pageSize: [
        this.chart.page_size,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0),
          Validators.maxLength(255)
        ])
      ]
    });

    this.pageSize = this.pageSizeForm.controls['pageSize'];

    this.pageSizeChange.emit({
      pageSizeValid: this.pageSizeForm.valid
    });
  }

  pageSizeBlur() {
    if (this.pageSize.value !== this.chart.page_size) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        page_size: this.pageSize.value
      });

      this.pageSizeChange.emit({
        pageSizeValid: this.pageSizeForm.valid,
        chart: this.chart
      });
    }
  }
}
