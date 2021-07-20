import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ColumnField } from '~front/app/queries/mq.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { StructService } from '~front/app/services/struct.service';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';

export class ColorSchemeItem {
  label: string;
  value: common.ChartColorSchemeEnum;
}

export class SchemeTypeItem {
  label: string;
  value: common.ChartSchemeTypeEnum;
}

export class InterpolationItem {
  label: string;
  value: common.ChartInterpolationEnum;
}

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

  xFieldForm: FormGroup = this.fb.group({
    xField: [undefined]
  });

  yFieldForm: FormGroup = this.fb.group({
    yField: [undefined]
  });

  multiFieldForm: FormGroup = this.fb.group({
    multiField: [undefined]
  });

  valueFieldForm: FormGroup = this.fb.group({
    valueField: [undefined]
  });

  previousValueFieldForm: FormGroup = this.fb.group({
    previousValueField: [undefined]
  });

  colorSchemeForm: FormGroup = this.fb.group({
    colorScheme: [undefined]
  });

  schemeTypeForm: FormGroup = this.fb.group({
    schemeType: [undefined]
  });

  interpolationForm: FormGroup = this.fb.group({
    interpolation: [undefined]
  });

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

  unitsForm: FormGroup = this.fb.group({
    units: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  colorSchemesList: ColorSchemeItem[] = [
    {
      label: 'Vivid (ordinal)',
      value: common.ChartColorSchemeEnum.Vivid
    },
    {
      label: 'Natural (ordinal)',
      value: common.ChartColorSchemeEnum.Natural
    },
    {
      label: 'Cool (ordinal)',
      value: common.ChartColorSchemeEnum.Cool
    },
    {
      label: 'Fire (ordinal)',
      value: common.ChartColorSchemeEnum.Fire
    },
    {
      label: 'Solar (continuous)',
      value: common.ChartColorSchemeEnum.Solar
    },
    {
      label: 'Air (continuous)',
      value: common.ChartColorSchemeEnum.Air
    },
    {
      label: 'Aqua (continuous)',
      value: common.ChartColorSchemeEnum.Aqua
    },
    {
      label: 'Flame (ordinal)',
      value: common.ChartColorSchemeEnum.Flame
    },
    {
      label: 'Ocean (ordinal)',
      value: common.ChartColorSchemeEnum.Ocean
    },
    {
      label: 'Forest (ordinal)',
      value: common.ChartColorSchemeEnum.Forest
    },
    {
      label: 'Horizon (ordinal)',
      value: common.ChartColorSchemeEnum.Horizon
    },
    {
      label: 'Neons (ordinal)',
      value: common.ChartColorSchemeEnum.Neons
    },
    {
      label: 'Picnic (ordinal)',
      value: common.ChartColorSchemeEnum.Picnic
    },
    {
      label: 'Night (ordinal)',
      value: common.ChartColorSchemeEnum.Night
    },
    {
      label: 'NightLights (ordinal)',
      value: common.ChartColorSchemeEnum.NightLights
    }
  ];

  schemeTypesList: SchemeTypeItem[] = [
    {
      label: 'Ordinal',
      value: common.ChartSchemeTypeEnum.Ordinal
    },
    {
      label: 'Linear',
      value: common.ChartSchemeTypeEnum.Linear
    }
  ];

  interpolationsList: InterpolationItem[] = [
    {
      label: 'Basis',
      value: common.ChartInterpolationEnum.Basis
    },
    {
      label: 'Basis closed',
      value: common.ChartInterpolationEnum.BasisClosed
    },
    {
      label: 'Bundle',
      value: common.ChartInterpolationEnum.Bundle
    },
    {
      label: 'Cardinal',
      value: common.ChartInterpolationEnum.Cardinal
    },
    {
      label: 'Cardinal closed',
      value: common.ChartInterpolationEnum.CardinalClosed
    },
    {
      label: 'Catmull rom',
      value: common.ChartInterpolationEnum.CatmullRom
    },
    {
      label: 'Catmull rom closed',
      value: common.ChartInterpolationEnum.CatmullRomClosed
    },
    {
      label: 'Linear',
      value: common.ChartInterpolationEnum.Linear
    },
    {
      label: 'Linear closed',
      value: common.ChartInterpolationEnum.LinearClosed
    },
    {
      label: 'Monotone X',
      value: common.ChartInterpolationEnum.MonotoneX
    },
    {
      label: 'Monotone Y',
      value: common.ChartInterpolationEnum.MonotoneY
    },
    {
      label: 'Natural',
      value: common.ChartInterpolationEnum.Natural
    },
    {
      label: 'Step',
      value: common.ChartInterpolationEnum.Step
    },
    {
      label: 'Step after',
      value: common.ChartInterpolationEnum.StepAfter
    },
    {
      label: 'Step before',
      value: common.ChartInterpolationEnum.StepBefore
    }
  ];

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

    this.setValueAndMark({
      control: this.xFieldForm.controls['xField'],
      value: this.chart.xField
    });

    this.setValueAndMark({
      control: this.yFieldForm.controls['yField'],
      value: this.chart.yField
    });

    this.setValueAndMark({
      control: this.multiFieldForm.controls['multiField'],
      value: this.chart.multiField
    });

    this.setValueAndMark({
      control: this.valueFieldForm.controls['valueField'],
      value: this.chart.valueField
    });

    this.setValueAndMark({
      control: this.previousValueFieldForm.controls['previousValueField'],
      value: this.chart.previousValueField
    });

    this.setValueAndMark({
      control: this.colorSchemeForm.controls['colorScheme'],
      value: this.chart.colorScheme
    });

    this.setValueAndMark({
      control: this.schemeTypeForm.controls['schemeType'],
      value: this.chart.schemeType
    });

    this.setValueAndMark({
      control: this.interpolationForm.controls['interpolation'],
      value: this.chart.interpolation
    });

    this.setValueAndMark({
      control: this.pageSizeForm.controls['pageSize'],
      value: this.chart.pageSize
    });

    this.setValueAndMark({
      control: this.unitsForm.controls['units'],
      value: this.chart.units
    });
  }

  setValueAndMark(item: { control: AbstractControl; value: any }) {
    let { control, value } = item;

    control.setValue(value);
    control.markAsTouched();
  }

  getIsValid() {
    let isChartValid = false;

    if (this.chart.type === common.ChartTypeEnum.Table) {
      isChartValid =
        this.pageSizeForm.controls['pageSize'].valid &&
        this.unitsForm.controls['units'].valid;
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

  unitsBlur() {
    let units = this.unitsForm.controls['units'].value;

    if (units === this.chart.units) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.units = units;
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

  valueFieldChange() {
    let valueField = this.valueFieldForm.controls['valueField'].value;
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.valueField = valueField;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  previousValueFieldChange() {
    let previousValueField = this.previousValueFieldForm.controls[
      'previousValueField'
    ].value;
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.previousValueField = previousValueField;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  colorSchemeChange() {
    let colorScheme = this.colorSchemeForm.controls['colorScheme'].value;
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.colorScheme = colorScheme;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  schemeTypeChange() {
    let schemeType = this.schemeTypeForm.controls['schemeType'].value;
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.schemeType = schemeType;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  interpolationChange() {
    let interpolation = this.interpolationForm.controls['interpolation'].value;
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.interpolation = interpolation;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  bandColorChange($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.bandColor = $event.color;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  cardColorChange($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.cardColor = $event.color;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  textColorChange($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.textColor = $event.color;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  emptyColorChange($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.emptyColor = $event.color;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }
}
