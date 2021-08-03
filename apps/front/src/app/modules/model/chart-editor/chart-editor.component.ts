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
import { constants } from '~front/barrels/constants';

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

  hideColumnsChartTypes = constants.hideColumnsChartTypes;
  xFieldChartTypes = constants.xFieldChartTypes;
  yFieldChartTypes = constants.yFieldChartTypes;
  yFieldsChartTypes = constants.yFieldsChartTypes;
  multiFieldChartTypes = constants.multiFieldChartTypes;
  valueFieldChartTypes = constants.valueFieldChartTypes;
  previousValueFieldChartTypes = constants.previousValueFieldChartTypes;

  @Input()
  chart: common.Chart;

  @Input()
  sortedColumns: ColumnField[];
  sortedColumnsPlusEmpty: ColumnField[];

  sortedDimensions: ColumnField[];
  sortedDimensionsPlusEmpty: ColumnField[];

  sortedMeasuresAndCalculations: ColumnField[];
  sortedMeasuresAndCalculationsPlusEmpty: ColumnField[];

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
        Validators.required,
        ValidationService.integerOrEmptyValidator,
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
        ValidationService.integerOrEmptyValidator,
        Validators.min(0)
      ]
    ]
  });

  startAngleForm: FormGroup = this.fb.group({
    startAngle: [
      undefined,
      [Validators.required, ValidationService.integerOrEmptyValidator]
    ]
  });

  arcWidthForm: FormGroup = this.fb.group({
    arcWidth: [
      undefined,
      [
        Validators.required,
        ValidationService.numberOrEmptyValidator,
        Validators.min(0)
      ]
    ]
  });

  minForm: FormGroup = this.fb.group({
    min: [
      undefined,
      [Validators.required, ValidationService.integerOrEmptyValidator]
    ]
  });

  maxForm: FormGroup = this.fb.group({
    max: [undefined, [ValidationService.integerOrEmptyValidator]]
  });

  xScaleMaxForm: FormGroup = this.fb.group({
    xScaleMax: [undefined, [ValidationService.numberOrEmptyValidator]]
  });

  yScaleMinForm: FormGroup = this.fb.group({
    yScaleMin: [
      undefined,
      [
        ValidationService.numberOrEmptyValidator,
        ValidationService.notZeroOrEmptyValidator
      ]
    ]
  });

  yScaleMaxForm: FormGroup = this.fb.group({
    yScaleMax: [undefined, [ValidationService.numberOrEmptyValidator]]
  });

  barPaddingForm: FormGroup = this.fb.group({
    barPadding: [
      undefined,
      [
        Validators.required,
        ValidationService.integerOrEmptyValidator,
        Validators.min(0)
      ]
    ]
  });

  bigSegmentsForm: FormGroup = this.fb.group({
    bigSegments: [
      undefined,
      [
        Validators.required,
        ValidationService.integerOrEmptyValidator,
        Validators.min(1)
      ]
    ]
  });

  smallSegmentsForm: FormGroup = this.fb.group({
    smallSegments: [
      undefined,
      [
        Validators.required,
        ValidationService.integerOrEmptyValidator,
        Validators.min(0)
      ]
    ]
  });

  groupPaddingForm: FormGroup = this.fb.group({
    groupPadding: [
      undefined,
      [
        Validators.required,
        ValidationService.integerOrEmptyValidator,
        Validators.min(0)
      ]
    ]
  });

  innerPaddingForm: FormGroup = this.fb.group({
    innerPadding: [
      undefined,
      [
        Validators.required,
        ValidationService.integerOrEmptyValidator,
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
      label: 'Vivid',
      value: common.ChartColorSchemeEnum.Vivid
    },
    {
      label: 'Natural',
      value: common.ChartColorSchemeEnum.Natural
    },
    {
      label: 'Cool',
      value: common.ChartColorSchemeEnum.Cool
    },
    {
      label: 'Fire',
      value: common.ChartColorSchemeEnum.Fire
    },

    {
      label: 'Flame',
      value: common.ChartColorSchemeEnum.Flame
    },
    {
      label: 'Ocean',
      value: common.ChartColorSchemeEnum.Ocean
    },
    {
      label: 'Forest',
      value: common.ChartColorSchemeEnum.Forest
    },
    {
      label: 'Horizon',
      value: common.ChartColorSchemeEnum.Horizon
    },
    {
      label: 'Neons',
      value: common.ChartColorSchemeEnum.Neons
    },
    {
      label: 'Picnic',
      value: common.ChartColorSchemeEnum.Picnic
    },
    {
      label: 'Night',
      value: common.ChartColorSchemeEnum.Night
    },
    {
      label: 'NightLights',
      value: common.ChartColorSchemeEnum.NightLights
    },
    {
      label: 'Solar (linear)',
      value: common.ChartColorSchemeEnum.Solar
    },
    {
      label: 'Air (linear)',
      value: common.ChartColorSchemeEnum.Air
    },
    {
      label: 'Aqua (linear)',
      value: common.ChartColorSchemeEnum.Aqua
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

    let emptyColumn: ColumnField = {
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
    };

    this.sortedColumnsPlusEmpty = [...this.sortedColumns, emptyColumn];

    this.sortedDimensions = this.sortedColumns.filter(
      x => x.fieldClass === common.FieldClassEnum.Dimension
    );

    this.sortedDimensionsPlusEmpty = [...this.sortedDimensions, emptyColumn];

    this.sortedMeasuresAndCalculations = this.sortedColumns.filter(
      x =>
        x.fieldClass === common.FieldClassEnum.Measure ||
        x.fieldClass === common.FieldClassEnum.Calculation
    );

    this.sortedMeasuresAndCalculationsPlusEmpty = [
      ...this.sortedMeasuresAndCalculations,
      emptyColumn
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
      control: this.startAngleForm.controls['startAngle'],
      value: this.chart.startAngle
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
      control: this.xScaleMaxForm.controls['xScaleMax'],
      value: this.chart.xScaleMax
    });

    this.setValueAndMark({
      control: this.yScaleMinForm.controls['yScaleMin'],
      value: this.chart.yScaleMin
    });

    this.setValueAndMark({
      control: this.yScaleMaxForm.controls['yScaleMax'],
      value: this.chart.yScaleMax
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
    } else if (this.chart.type === common.ChartTypeEnum.BarVertical) {
      isChartValid =
        this.yScaleMaxForm.controls['yScaleMax'].valid &&
        this.barPaddingForm.controls['barPadding'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.BarVerticalGrouped) {
      isChartValid =
        this.yScaleMaxForm.controls['yScaleMax'].valid &&
        this.barPaddingForm.controls['barPadding'].valid &&
        this.groupPaddingForm.controls['groupPadding'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.BarVerticalStacked) {
      isChartValid =
        this.yScaleMaxForm.controls['yScaleMax'].valid &&
        this.barPaddingForm.controls['barPadding'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.BarVerticalNormalized) {
      isChartValid =
        this.barPaddingForm.controls['barPadding'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.BarHorizontal) {
      isChartValid =
        this.xScaleMaxForm.controls['xScaleMax'].valid &&
        this.barPaddingForm.controls['barPadding'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.BarHorizontalGrouped) {
      isChartValid =
        this.xScaleMaxForm.controls['xScaleMax'].valid &&
        this.barPaddingForm.controls['barPadding'].valid &&
        this.groupPaddingForm.controls['groupPadding'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.BarHorizontalStacked) {
      isChartValid =
        this.xScaleMaxForm.controls['xScaleMax'].valid &&
        this.barPaddingForm.controls['barPadding'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (
      this.chart.type === common.ChartTypeEnum.BarHorizontalNormalized
    ) {
      isChartValid =
        this.barPaddingForm.controls['barPadding'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.Pie) {
      isChartValid =
        this.arcWidthForm.controls['arcWidth'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.PieAdvanced) {
      isChartValid = true;
    } else if (this.chart.type === common.ChartTypeEnum.PieGrid) {
      isChartValid = true;
    } else if (this.chart.type === common.ChartTypeEnum.Line) {
      isChartValid =
        this.yScaleMinForm.controls['yScaleMin'].valid &&
        this.yScaleMaxForm.controls['yScaleMax'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.Area) {
      isChartValid =
        this.yScaleMinForm.controls['yScaleMin'].valid &&
        this.yScaleMaxForm.controls['yScaleMax'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.AreaStacked) {
      isChartValid =
        this.yScaleMinForm.controls['yScaleMin'].valid &&
        this.yScaleMaxForm.controls['yScaleMax'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.AreaNormalized) {
      isChartValid =
        this.legendTitleForm.controls['legendTitle'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.HeatMap) {
      isChartValid =
        this.innerPaddingForm.controls['innerPadding'].valid &&
        this.xAxisLabelForm.controls['xAxisLabel'].valid &&
        this.yAxisLabelForm.controls['yAxisLabel'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.TreeMap) {
      isChartValid = true;
    } else if (this.chart.type === common.ChartTypeEnum.NumberCard) {
      isChartValid = true;
    } else if (this.chart.type === common.ChartTypeEnum.Gauge) {
      isChartValid =
        this.unitsForm.controls['units'].valid &&
        this.angleSpanForm.controls['angleSpan'].valid &&
        this.startAngleForm.controls['startAngle'].valid &&
        this.minForm.controls['min'].valid &&
        this.maxForm.controls['max'].valid &&
        this.bigSegmentsForm.controls['bigSegments'].valid &&
        this.smallSegmentsForm.controls['smallSegments'].valid &&
        this.legendTitleForm.controls['legendTitle'].valid;
    } else if (this.chart.type === common.ChartTypeEnum.GaugeLinear) {
      isChartValid =
        this.unitsForm.controls['units'].valid &&
        this.minForm.controls['min'].valid &&
        this.maxForm.controls['max'].valid;
    } else {
      isChartValid = true;
    }

    return isChartValid;
  }

  updateMconfig(newMconfig: common.Mconfig) {
    let isValid = this.getIsValid();
    if (isValid === true) {
      newMconfig.chart.isValid = true;
      this.mconfigService.navCreateMconfigAndQuery(newMconfig);
    }
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

  pageSizeBlur() {
    let value = this.pageSizeForm.controls['pageSize'].value;

    let pageSize = common.isUndefinedOrEmpty(value) ? undefined : Number(value);

    if (
      common.isUndefined(pageSize) &&
      common.isUndefined(this.chart.pageSize)
    ) {
      return;
    }

    if (pageSize === this.chart.pageSize) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.pageSize = pageSize;
    this.updateMconfig(newMconfig);
  }

  angleSpanBlur() {
    let value = this.angleSpanForm.controls['angleSpan'].value;

    let angleSpan = common.isUndefinedOrEmpty(value)
      ? undefined
      : Number(value);

    if (
      common.isUndefined(angleSpan) &&
      common.isUndefined(this.chart.angleSpan)
    ) {
      return;
    }

    if (angleSpan === this.chart.angleSpan) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.angleSpan = angleSpan;
    this.updateMconfig(newMconfig);
  }

  startAngleBlur() {
    let value = this.startAngleForm.controls['startAngle'].value;

    let startAngle = common.isUndefinedOrEmpty(value)
      ? undefined
      : Number(value);

    if (
      common.isUndefined(startAngle) &&
      common.isUndefined(this.chart.startAngle)
    ) {
      return;
    }

    if (startAngle === this.chart.startAngle) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.startAngle = startAngle;
    this.updateMconfig(newMconfig);
  }

  arcWidthBlur() {
    let value = this.arcWidthForm.controls['arcWidth'].value;

    let arcWidth = common.isUndefinedOrEmpty(value) ? undefined : Number(value);

    if (
      common.isUndefined(arcWidth) &&
      common.isUndefined(this.chart.arcWidth)
    ) {
      return;
    }

    if (arcWidth === this.chart.arcWidth) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.arcWidth = arcWidth;
    this.updateMconfig(newMconfig);
  }

  minBlur() {
    let value = this.minForm.controls['min'].value;

    let min = common.isUndefinedOrEmpty(value) ? undefined : Number(value);

    if (common.isUndefined(min) && common.isUndefined(this.chart.min)) {
      return;
    }

    if (min === this.chart.min) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.min = min;
    this.updateMconfig(newMconfig);
  }

  maxBlur() {
    let value = this.maxForm.controls['max'].value;

    let max = common.isUndefinedOrEmpty(value) ? undefined : Number(value);

    if (common.isUndefined(max) && common.isUndefined(this.chart.max)) {
      return;
    }

    if (max === this.chart.max) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.max = max;
    this.updateMconfig(newMconfig);
  }

  xScaleMaxBlur() {
    let value = this.xScaleMaxForm.controls['xScaleMax'].value;

    let xScaleMax = common.isUndefinedOrEmpty(value)
      ? undefined
      : Number(value);

    if (
      common.isUndefined(xScaleMax) &&
      common.isUndefined(this.chart.xScaleMax)
    ) {
      return;
    }

    if (xScaleMax === this.chart.xScaleMax) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.xScaleMax = xScaleMax;
    this.updateMconfig(newMconfig);
  }

  yScaleMinBlur() {
    let value = this.yScaleMinForm.controls['yScaleMin'].value;

    let yScaleMin = common.isUndefinedOrEmpty(value)
      ? undefined
      : Number(value);

    if (
      common.isUndefined(yScaleMin) &&
      common.isUndefined(this.chart.yScaleMin)
    ) {
      return;
    }

    if (yScaleMin === this.chart.yScaleMin) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.yScaleMin = yScaleMin;
    this.updateMconfig(newMconfig);
  }

  yScaleMaxBlur() {
    let value = this.yScaleMaxForm.controls['yScaleMax'].value;

    let yScaleMax = common.isUndefinedOrEmpty(value)
      ? undefined
      : Number(value);

    if (
      common.isUndefined(yScaleMax) &&
      common.isUndefined(this.chart.yScaleMax)
    ) {
      return;
    }

    if (yScaleMax === this.chart.yScaleMax) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.yScaleMax = yScaleMax;
    this.updateMconfig(newMconfig);
  }

  barPaddingBlur() {
    let value = this.barPaddingForm.controls['barPadding'].value;

    let barPadding = common.isUndefinedOrEmpty(value)
      ? undefined
      : Number(value);

    if (
      common.isUndefined(barPadding) &&
      common.isUndefined(this.chart.barPadding)
    ) {
      return;
    }

    if (barPadding === this.chart.barPadding) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.barPadding = barPadding;
    this.updateMconfig(newMconfig);
  }

  bigSegmentsBlur() {
    let value = this.bigSegmentsForm.controls['bigSegments'].value;

    let bigSegments = common.isUndefinedOrEmpty(value)
      ? undefined
      : Number(value);

    if (
      common.isUndefined(bigSegments) &&
      common.isUndefined(this.chart.bigSegments)
    ) {
      return;
    }

    if (bigSegments === this.chart.bigSegments) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.bigSegments = bigSegments;
    this.updateMconfig(newMconfig);
  }

  smallSegmentsBlur() {
    let value = this.smallSegmentsForm.controls['smallSegments'].value;

    let smallSegments = common.isUndefinedOrEmpty(value)
      ? undefined
      : Number(value);

    if (
      common.isUndefined(smallSegments) &&
      common.isUndefined(this.chart.smallSegments)
    ) {
      return;
    }

    if (smallSegments === this.chart.smallSegments) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.smallSegments = smallSegments;
    this.updateMconfig(newMconfig);
  }

  groupPaddingBlur() {
    let value = this.groupPaddingForm.controls['groupPadding'].value;

    let groupPadding = common.isUndefinedOrEmpty(value)
      ? undefined
      : Number(value);

    if (
      common.isUndefined(groupPadding) &&
      common.isUndefined(this.chart.groupPadding)
    ) {
      return;
    }

    if (groupPadding === this.chart.groupPadding) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.groupPadding = groupPadding;
    this.updateMconfig(newMconfig);
  }

  innerPaddingBlur() {
    let value = this.innerPaddingForm.controls['innerPadding'].value;

    let innerPadding = common.isUndefinedOrEmpty(value)
      ? undefined
      : Number(value);

    if (
      common.isUndefined(innerPadding) &&
      common.isUndefined(this.chart.innerPadding)
    ) {
      return;
    }

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

    if (
      newMconfig.chart.type === common.ChartTypeEnum.Area ||
      newMconfig.chart.type === common.ChartTypeEnum.AreaNormalized ||
      newMconfig.chart.type === common.ChartTypeEnum.AreaStacked ||
      newMconfig.chart.type === common.ChartTypeEnum.BarHorizontalGrouped ||
      newMconfig.chart.type === common.ChartTypeEnum.BarHorizontalNormalized ||
      newMconfig.chart.type === common.ChartTypeEnum.BarHorizontalStacked ||
      newMconfig.chart.type === common.ChartTypeEnum.BarVerticalGrouped ||
      newMconfig.chart.type === common.ChartTypeEnum.BarVerticalNormalized ||
      newMconfig.chart.type === common.ChartTypeEnum.BarVerticalStacked ||
      newMconfig.chart.type === common.ChartTypeEnum.HeatMap ||
      newMconfig.chart.type === common.ChartTypeEnum.Line
    ) {
      let newMultiFieldValue = this.sortedDimensions.filter(
        x => x.id !== xField
      )[0].id;
      this.setValueAndMark({
        control: this.multiFieldForm.controls['multiField'],
        value: newMultiFieldValue
      });
      newMconfig.chart.multiField = newMultiFieldValue;
    }

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

    let newXFieldValue = this.sortedDimensions.filter(
      x => x.id !== multiField
    )[0].id;

    this.setValueAndMark({
      control: this.xFieldForm.controls['xField'],
      value: newXFieldValue
    });

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.multiField = multiField;
    newMconfig.chart.xField = newXFieldValue;
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

    let newSchemeTypeValue: common.ChartSchemeTypeEnum =
      [
        common.ChartColorSchemeEnum.Solar,
        common.ChartColorSchemeEnum.Air,
        common.ChartColorSchemeEnum.Aqua
      ].indexOf(colorScheme) > -1
        ? common.ChartSchemeTypeEnum.Linear
        : common.ChartSchemeTypeEnum.Ordinal;

    this.setValueAndMark({
      control: this.schemeTypeForm.controls['schemeType'],
      value: newSchemeTypeValue
    });

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.colorScheme = colorScheme;
    newMconfig.chart.schemeType = newSchemeTypeValue;
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

  toggleXAxis($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.xAxis = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleYAxis($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.yAxis = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleShowXAxisLabel($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.showXAxisLabel = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleShowYAxisLabel($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.showYAxisLabel = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleShowAxis($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.showAxis = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleAnimations($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.animations = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleGradient($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.gradient = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleLegend($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.legend = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleTooltipDisabled($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.tooltipDisabled = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleRoundEdges($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.roundEdges = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleRoundDomains($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.roundDomains = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleShowGridLines($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.showGridLines = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleTimeline($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.timeline = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleAutoScale($event: any) {
    this.setValueAndMark({
      control: this.yScaleMinForm.controls['yScaleMin'],
      value: null
    });

    this.setValueAndMark({
      control: this.yScaleMaxForm.controls['yScaleMax'],
      value: null
    });

    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.autoScale = $event;
    newMconfig.chart.yScaleMin = null;
    newMconfig.chart.yScaleMax = null;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleDoughnut($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.doughnut = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleExplodeSlices($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.explodeSlices = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleLabels($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.labels = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  toggleShowDataLabel($event: any) {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.showDataLabel = $event;
    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }
}
