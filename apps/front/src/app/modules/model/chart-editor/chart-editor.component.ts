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

  angleSpanForm: FormGroup = this.fb.group({
    angleSpan: [
      undefined,
      [
        Validators.required,
        ValidationService.integerValidator,
        Validators.min(0)
      ]
    ]
  });

  arcWidthForm: FormGroup = this.fb.group({
    arcWidth: [
      undefined,
      [
        Validators.required,
        ValidationService.numberValidator,
        Validators.min(0)
      ]
    ]
  });

  minForm: FormGroup = this.fb.group({
    min: [undefined, [Validators.required, ValidationService.integerValidator]]
  });

  maxForm: FormGroup = this.fb.group({
    max: [undefined, [Validators.required, ValidationService.integerValidator]]
  });

  barPaddingForm: FormGroup = this.fb.group({
    barPadding: [
      undefined,
      [
        Validators.required,
        ValidationService.integerValidator,
        Validators.min(0)
      ]
    ]
  });

  bigSegmentsForm: FormGroup = this.fb.group({
    bigSegments: [
      undefined,
      [
        Validators.required,
        ValidationService.integerValidator,
        Validators.min(1)
      ]
    ]
  });

  smallSegmentsForm: FormGroup = this.fb.group({
    smallSegments: [
      undefined,
      [
        Validators.required,
        ValidationService.integerValidator,
        Validators.min(0)
      ]
    ]
  });

  groupPaddingForm: FormGroup = this.fb.group({
    groupPadding: [
      undefined,
      [
        Validators.required,
        ValidationService.integerValidator,
        Validators.min(0)
      ]
    ]
  });

  innerPaddingForm: FormGroup = this.fb.group({
    innerPadding: [
      undefined,
      [
        Validators.required,
        ValidationService.integerValidator,
        Validators.min(0)
      ]
    ]
  });

  legendTitleForm: FormGroup = this.fb.group({
    legendTitle: [undefined, [Validators.maxLength(255)]]
  });

  xAxisLabelForm: FormGroup = this.fb.group({
    xAxisLabel: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  yAxisLabelForm: FormGroup = this.fb.group({
    yAxisLabel: [undefined, [Validators.required, Validators.maxLength(255)]]
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

    this.setValueAndMark({
      control: this.angleSpanForm.controls['angleSpan'],
      value: this.chart.angleSpan
    });

    this.setValueAndMark({
      control: this.arcWidthForm.controls['arcWidth'],
      value: this.chart.arcWidth
    });

    this.setValueAndMark({
      control: this.minForm.controls['min'],
      value: this.chart.min
    });

    this.setValueAndMark({
      control: this.maxForm.controls['max'],
      value: this.chart.max
    });

    this.setValueAndMark({
      control: this.barPaddingForm.controls['barPadding'],
      value: this.chart.barPadding
    });

    this.setValueAndMark({
      control: this.bigSegmentsForm.controls['bigSegments'],
      value: this.chart.bigSegments
    });

    this.setValueAndMark({
      control: this.smallSegmentsForm.controls['smallSegments'],
      value: this.chart.smallSegments
    });

    this.setValueAndMark({
      control: this.groupPaddingForm.controls['groupPadding'],
      value: this.chart.groupPadding
    });

    this.setValueAndMark({
      control: this.innerPaddingForm.controls['innerPadding'],
      value: this.chart.innerPadding
    });

    this.setValueAndMark({
      control: this.legendTitleForm.controls['legendTitle'],
      value: this.chart.legendTitle
    });

    this.setValueAndMark({
      control: this.xAxisLabelForm.controls['xAxisLabel'],
      value: this.chart.xAxisLabel
    });

    this.setValueAndMark({
      control: this.yAxisLabelForm.controls['yAxisLabel'],
      value: this.chart.yAxisLabel
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
      isChartValid = this.pageSizeForm.controls['pageSize'].valid;
      //  &&
      // this.unitsForm.controls['units'].valid &&
      // this.angleSpanForm.controls['angleSpan'].valid &&
      // this.arcWidthForm.controls['arcWidth'].valid &&
      // this.minForm.controls['min'].valid &&
      // this.maxForm.controls['max'].valid &&
      // this.barPaddingForm.controls['barPadding'].valid &&
      // this.bigSegmentsForm.controls['bigSegments'].valid &&
      // this.smallSegmentsForm.controls['smallSegments'].valid &&
      // this.groupPaddingForm.controls['groupPadding'].valid &&
      // this.innerPaddingForm.controls['innerPadding'].valid &&
      // this.legendTitleForm.controls['legendTitle'].valid &&
      // this.xAxisLabelForm.controls['xAxisLabel'].valid &&
      // this.yAxisLabelForm.controls['yAxisLabel'].valid
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

  angleSpanBlur() {
    let angleSpan = Number(this.angleSpanForm.controls['angleSpan'].value);

    if (angleSpan === this.chart.angleSpan) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.angleSpan = angleSpan;
    this.updateMconfig(newMconfig);
  }

  arcWidthBlur() {
    let arcWidth = Number(this.arcWidthForm.controls['arcWidth'].value);

    if (arcWidth === this.chart.arcWidth) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.arcWidth = arcWidth;
    this.updateMconfig(newMconfig);
  }

  minBlur() {
    let min = Number(this.minForm.controls['min'].value);

    if (min === this.chart.min) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.min = min;
    this.updateMconfig(newMconfig);
  }

  maxBlur() {
    let max = Number(this.maxForm.controls['max'].value);

    if (max === this.chart.max) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.max = max;
    this.updateMconfig(newMconfig);
  }

  barPaddingBlur() {
    let barPadding = Number(this.barPaddingForm.controls['barPadding'].value);

    if (barPadding === this.chart.barPadding) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.barPadding = barPadding;
    this.updateMconfig(newMconfig);
  }

  bigSegmentsBlur() {
    let bigSegments = Number(
      this.bigSegmentsForm.controls['bigSegments'].value
    );

    if (bigSegments === this.chart.bigSegments) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.bigSegments = bigSegments;
    this.updateMconfig(newMconfig);
  }

  smallSegmentsBlur() {
    let smallSegments = Number(
      this.smallSegmentsForm.controls['smallSegments'].value
    );

    if (smallSegments === this.chart.smallSegments) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.smallSegments = smallSegments;
    this.updateMconfig(newMconfig);
  }

  groupPaddingBlur() {
    let groupPadding = Number(
      this.groupPaddingForm.controls['groupPadding'].value
    );

    if (groupPadding === this.chart.groupPadding) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.groupPadding = groupPadding;
    this.updateMconfig(newMconfig);
  }

  innerPaddingBlur() {
    let innerPadding = Number(
      this.innerPaddingForm.controls['innerPadding'].value
    );

    if (innerPadding === this.chart.innerPadding) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.innerPadding = innerPadding;
    this.updateMconfig(newMconfig);
  }

  legendTitleBlur() {
    let legendTitle = this.legendTitleForm.controls['legendTitle'].value;
    if (legendTitle === this.chart.legendTitle) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.legendTitle = legendTitle;
    this.updateMconfig(newMconfig);
  }

  xAxisLabelBlur() {
    let xAxisLabel = this.xAxisLabelForm.controls['xAxisLabel'].value;

    if (xAxisLabel === this.chart.xAxisLabel) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.xAxisLabel = xAxisLabel;
    this.updateMconfig(newMconfig);
  }

  yAxisLabelBlur() {
    let yAxisLabel = this.yAxisLabelForm.controls['yAxisLabel'].value;

    if (yAxisLabel === this.chart.yAxisLabel) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.yAxisLabel = yAxisLabel;
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
