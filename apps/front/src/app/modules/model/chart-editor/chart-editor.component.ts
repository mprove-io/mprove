import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MconfigService } from '~front/app/services/mconfig.service';
import { StructService } from '~front/app/services/struct.service';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-editor',
  templateUrl: './chart-editor.component.html'
})
export class ChartEditorComponent implements OnChanges {
  chartTypeEnum = common.ChartTypeEnum;

  @Input()
  chart: common.Chart;

  pageSizeForm: FormGroup = this.fb.group({
    pageSize: [
      undefined,
      [
        ValidationService.integerValidator,
        Validators.min(1),
        Validators.maxLength(255)
      ]
    ]
  });

  constructor(
    private fb: FormBuilder,
    private structService: StructService,
    private mconfigService: MconfigService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.pageSizeForm.controls['pageSize'].setValue(this.chart.pageSize);
    this.pageSizeForm.controls['pageSize'].markAsTouched();
  }

  getIsValid() {
    let isChartValid = false;

    if (this.chart.type === common.ChartTypeEnum.Table) {
      isChartValid = this.pageSizeForm.controls['pageSize'].valid;
    }

    return isChartValid;
  }

  updateMconfig(newMconfig: common.Mconfig) {
    newMconfig.chart.isValid = this.getIsValid();
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  pageSizeBlur() {
    let newMconfig = this.structService.makeMconfig();

    newMconfig.chart.pageSize = Number(
      this.pageSizeForm.controls['pageSize'].value
    );

    this.updateMconfig(newMconfig);
  }
}
