import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChartTypeEnum } from '../../../../../../../libs/common/src/_index';
import { common } from '../../../../barrels/common';
import { setValueAndMark } from '../../../functions/set-value-and-mark';
import { MconfigService } from '../../../services/mconfig.service';
import { StructService } from '../../../services/struct.service';

interface MyControl {
  friendlyName: string;
  mConfigName: string;
  chartTypes: ChartTypeEnum[];
  type: 'selector' | 'checkbox' | 'textbox';
  selectorValues?: string[];
  useSortedDimensions?: boolean;
  inChange?: () => void;
  outChange?: () => void;
  formControl: FormControl;
}

@Component({
  selector: 'm-new-chart-editor',
  templateUrl: './new-chart-editor.component.html'
})
export class NewChartEditorComponent implements OnChanges {
  constructor(
    private mconfigService: MconfigService,
    private structService: StructService
  ) {}

  @Input()
  mConfig: common.MconfigX;

  sortedDimensions: common.MconfigField[];

  controls: MyControl[] = [
    {
      friendlyName: 'X Field',
      mConfigName: 'axXField',
      type: 'selector',
      chartTypes: [ChartTypeEnum.AgBar],
      useSortedDimensions: true,
      formControl: new FormControl(),
      inChange: function () {},
      outChange: () => {
        this.xFieldChange();
      }
    },
    {
      friendlyName: 'Y Field',
      mConfigName: 'axYField',
      type: 'selector',
      chartTypes: [ChartTypeEnum.AgBar],
      useSortedDimensions: true,
      formControl: new FormControl(),
      inChange: function () {},
      outChange: () => {
        // this.xFieldChange();
      }
    },
    {
      friendlyName: 'Multi field',
      mConfigName: 'axMultiField',
      type: 'selector',
      chartTypes: [ChartTypeEnum.AgBar],
      useSortedDimensions: true,
      formControl: new FormControl(),
      inChange: function () {},
      outChange: () => {
        // this.xFieldChange();
      }
    }
    // {
    //   friendlyName: 'My',
    //   mConfigName: 'axXField',
    //   type: 'selector',
    //   chartTypes: [ChartTypeEnum.AgBar],
    //   selectorValues: ['value1', 'value2'],
    //   useSortedDimensions: false,
    //   formControl: new FormControl()
    // }
  ];
  xFieldChange() {
    let xField = this.controls[0].formControl.value;

    let newMconfig = this.structService.makeMconfig();

    if (newMconfig.chart.type === common.ChartTypeEnum.AgBar) {
      // console.log(this.sortedDimensions);
      let newMultiFieldValue = this.sortedDimensions.filter(
        x => x.id !== xField
      )[0].id;

      setValueAndMark({
        control: this.controls.find(e => {
          return e.mConfigName === 'axMultiField';
        }).formControl,
        value: newMultiFieldValue
      });
      newMconfig.chart.multiField = newMultiFieldValue;
    }

    newMconfig.chart.xField = xField;
    this.mconfigService.navCreateTempMconfig({
      newMconfig: newMconfig
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.sortedDimensions = this.mConfig.fields.filter(
      x => x.fieldClass === common.FieldClassEnum.Dimension
    );

    this.controls.forEach(x => {
      x.formControl.setValue(
        this.mConfig.chart[x.mConfigName as keyof common.Chart]
      );
      x.formControl.markAsTouched();
    });
  }
}
