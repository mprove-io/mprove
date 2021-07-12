import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-editor',
  templateUrl: './chart-editor.component.html'
})
export class ChartEditorComponent implements OnInit, OnChanges {
  chartTypeEnum = common.ChartTypeEnum;

  @Input()
  chart: common.Chart;

  pageSizeForm: FormGroup = this.fb.group({
    pageSize: [
      undefined,
      [
        ValidationService.integerValidator,
        Validators.min(0),
        Validators.maxLength(255)
      ]
    ]
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.setValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setValues();
  }

  setValues() {
    this.pageSizeForm.controls['pageSize'].setValue(this.chart.pageSize);
  }

  pageSizeBlur() {}
}
