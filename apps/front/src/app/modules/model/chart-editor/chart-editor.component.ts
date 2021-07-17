import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnField } from '~front/app/queries/mq.query';
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

  @Input()
  sortedColumns: ColumnField[];

  sortedColumnsPlusEmpty: ColumnField[];

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

  xFieldForm: FormGroup = this.fb.group({
    xField: [undefined]
  });

  yFieldForm: FormGroup = this.fb.group({
    yField: [undefined]
  });

  multiFieldForm: FormGroup = this.fb.group({
    multiField: [undefined]
  });

  constructor(
    private fb: FormBuilder,
    private structService: StructService,
    private mconfigService: MconfigService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);

    this.sortedColumnsPlusEmpty = [
      ...this.sortedColumns,
      {
        id: undefined,
        hidden: undefined,
        label: undefined,
        fieldClass: undefined,
        result: undefined,
        sqlName: undefined,
        topId: undefined,
        topLabel: 'Empty',
        description: undefined,
        type: undefined,
        groupId: undefined,
        groupLabel: undefined,
        groupDescription: undefined,
        formatNumber: undefined,
        currencyPrefix: undefined,
        currencySuffix: undefined,
        sorting: undefined,
        sortingNumber: undefined,
        isHideColumn: undefined
      }
    ];

    this.pageSizeForm.controls['pageSize'].setValue(this.chart.pageSize);
    this.pageSizeForm.controls['pageSize'].markAsTouched();

    this.xFieldForm.controls['xField'].setValue(this.chart.xField);
    this.xFieldForm.controls['xField'].markAsTouched();

    this.yFieldForm.controls['yField'].setValue(this.chart.yField);
    this.yFieldForm.controls['yField'].markAsTouched();

    this.multiFieldForm.controls['multiField'].setValue(this.chart.multiField);
    this.multiFieldForm.controls['multiField'].markAsTouched();
  }

  getIsValid() {
    let isChartValid = false;

    if (this.chart.type === common.ChartTypeEnum.Table) {
      isChartValid = this.pageSizeForm.controls['pageSize'].valid;
    } else {
      isChartValid = true;
    }

    return isChartValid;
  }

  updateMconfig(newMconfig: common.Mconfig) {
    newMconfig.chart.isValid = this.getIsValid();
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  pageSizeBlur() {
    let pageSize = Number(this.pageSizeForm.controls['pageSize'].value);

    if (pageSize === this.chart.pageSize) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.pageSize = pageSize;
    this.updateMconfig(newMconfig);
  }

  hideColumnsIsChecked(id: string) {
    return this.chart.hideColumns.findIndex(x => x === id) > -1;
  }

  hideColumnsOnClick(id: string) {
    let index = this.chart.hideColumns.findIndex(x => x === id);

    let newMconfig = this.structService.makeMconfig();

    newMconfig.chart.hideColumns =
      index > -1
        ? [
            ...this.chart.hideColumns.slice(0, index),
            ...this.chart.hideColumns.slice(index + 1)
          ]
        : [...this.chart.hideColumns, id];

    this.updateMconfig(newMconfig);
  }

  yFieldsIsChecked(id: string) {
    return this.chart.yFields.findIndex(x => x === id) > -1;
  }

  yFieldsOnClick(id: string) {
    let index = this.chart.yFields.findIndex(x => x === id);

    let newMconfig = this.structService.makeMconfig();

    newMconfig.chart.yFields =
      index > -1
        ? [
            ...this.chart.yFields.slice(0, index),
            ...this.chart.yFields.slice(index + 1)
          ]
        : [...this.chart.yFields, id];

    this.updateMconfig(newMconfig);
  }

  xFieldChange() {
    let xField = this.xFieldForm.controls['xField'].value;
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.xField = xField;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  yFieldChange() {
    let yField = this.yFieldForm.controls['yField'].value;
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.yField = yField;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  multiFieldChange() {
    let multiField = this.multiFieldForm.controls['multiField'].value;
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.multiField = multiField;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }
}
