import {
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { StructQuery } from '~front/app/queries/struct.query';
import { DataService } from '~front/app/services/data.service';
import { FormatNumberService } from '~front/app/services/format-number.service';
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
  @ViewChild('xFieldSelect', { static: false })
  xFieldSelectElement: NgSelectComponent;

  @ViewChild('multiFieldSelect', { static: false })
  multiFieldSelectElement: NgSelectComponent;

  @ViewChild('valueFieldSelect', { static: false })
  valueFieldSelectElement: NgSelectComponent;

  @ViewChild('previousValueFieldSelect', { static: false })
  previousValueFieldSelectElement: NgSelectComponent;

  @ViewChild('yFieldSelect', { static: false })
  yFieldSelectElement: NgSelectComponent;

  @ViewChild('sizeFieldSelect', { static: false })
  sizeFieldSelectElement: NgSelectComponent;

  @ViewChild('colorSchemeSelect', { static: false })
  colorSchemeSelectElement: NgSelectComponent;

  @ViewChild('schemeTypeSelect', { static: false })
  schemeTypeSelectElement: NgSelectComponent;

  @ViewChild('interpolationSelect', { static: false })
  interpolationSelectElement: NgSelectComponent;

  @ViewChild('formatNumberDataLabelSelect', { static: false })
  formatNumberDataLabelSelectElement: NgSelectComponent;

  @ViewChild('formatNumberValueSelect', { static: false })
  formatNumberValueSelectElement: NgSelectComponent;

  @ViewChild('formatNumberAxisTickSelect', { static: false })
  formatNumberAxisTickSelectElement: NgSelectComponent;

  @ViewChild('formatNumberXAxisTickSelect', { static: false })
  formatNumberXAxisTickSelectElement: NgSelectComponent;

  @ViewChild('formatNumberYAxisTickSelect', { static: false })
  formatNumberYAxisTickSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.xFieldSelectElement?.close();
    this.multiFieldSelectElement?.close();
    this.valueFieldSelectElement?.close();
    this.previousValueFieldSelectElement?.close();
    this.yFieldSelectElement?.close();
    this.sizeFieldSelectElement?.close();
    this.colorSchemeSelectElement?.close();
    this.schemeTypeSelectElement?.close();
    this.interpolationSelectElement?.close();
    this.formatNumberDataLabelSelectElement?.close();
    this.formatNumberValueSelectElement?.close();
    this.formatNumberAxisTickSelectElement?.close();
    this.formatNumberXAxisTickSelectElement?.close();
    this.formatNumberYAxisTickSelectElement?.close();
  }

  chartTypeEnum = common.ChartTypeEnum;
  chartSchemeTypeEnum = common.ChartSchemeTypeEnum;

  hideColumnsChartTypes = common.hideColumnsChartTypes;
  xFieldChartTypes = common.xFieldChartTypes;
  yFieldChartTypes = common.yFieldUiChartTypes;
  yFieldsChartTypes = common.yFieldsUiChartTypes;
  sizeFieldChartTypes = common.sizeFieldChartTypes;
  multiFieldChartTypes = common.multiFieldChartTypes;
  nullableMultiFieldChartTypes = common.nullableMultiFieldChartTypes;
  // valueFieldChartTypes = common.valueFieldChartTypes;
  // previousValueFieldChartTypes = common.previousValueFieldChartTypes;

  // xAxisLabelChartTypes = common.xAxisLabelChartTypes;
  // yAxisLabelChartTypes = common.yAxisLabelChartTypes;
  // showXAxisLabelChartTypes = common.showXAxisLabelChartTypes;
  // showYAxisLabelChartTypes = common.showYAxisLabelChartTypes;
  // xAxisChartTypes = common.xAxisChartTypes;
  // yAxisChartTypes = common.yAxisChartTypes;
  // showAxisChartTypes = common.showAxisChartTypes;

  formatChartTypes = common.formatChartTypes;
  // angleSpanChartTypes = common.angleSpanChartTypes;
  // animationsChartTypes = common.animationsChartTypes;
  // arcWidthChartTypes = common.arcWidthChartTypes;
  // autoScaleChartTypes = common.autoScaleChartTypes;
  // bandColorChartTypes = common.bandColorChartTypes;
  // barPaddingChartTypes = common.barPaddingChartTypes;
  // bigSegmentsChartTypes = common.bigSegmentsChartTypes;
  // cardColorChartTypes = common.cardColorChartTypes;
  // colorSchemeChartTypes = common.colorSchemeChartTypes;
  // doughnutChartTypes = common.doughnutChartTypes;
  // emptyColorChartTypes = common.emptyColorChartTypes;
  // explodeSlicesChartTypes = common.explodeSlicesChartTypes;
  // gradientChartTypes = common.gradientChartTypes;
  // groupPaddingChartTypes = common.groupPaddingChartTypes;
  // innerPaddingChartTypes = common.innerPaddingChartTypes;
  // interpolationChartTypes = common.interpolationChartTypes;
  // labelsChartTypes = common.labelsChartTypes;
  // legendChartTypes = common.legendChartTypes;
  // legendTitleChartTypes = common.legendTitleChartTypes;
  // maxChartTypes = common.maxChartTypes;
  // minChartTypes = common.minChartTypes;
  pageSizeChartTypes = common.pageSizeChartTypes;
  // rangeFillOpacityChartTypes = common.rangeFillOpacityChartTypes;
  // roundDomainsChartTypes = common.roundDomainsChartTypes;
  // roundEdgesChartTypes = common.roundEdgesChartTypes;
  // schemeTypeChartTypes = common.schemeTypeChartTypes;
  // showDataLabelChartTypes = common.showDataLabelChartTypes;
  // showGridLinesChartTypes = common.showGridLinesChartTypes;
  // smallSegmentsChartTypes = common.smallSegmentsChartTypes;
  // startAngleChartTypes = common.startAngleChartTypes;
  // textColorChartTypes = common.textColorChartTypes;
  // timelineChartTypes = common.timelineChartTypes;
  // tooltipDisabledChartTypes = common.tooltipDisabledChartTypes;
  // unitsChartTypes = common.unitsChartTypes;
  // xScaleMaxChartTypes = common.xScaleMaxChartTypes;
  // yScaleMaxChartTypes = common.yScaleMaxChartTypes;
  // yScaleMinChartTypes = common.yScaleMinChartTypes;
  // formatNumberDataLabelChartTypes = common.formatNumberDataLabelChartTypes;
  // formatNumberValueChartTypes = common.formatNumberValueChartTypes;
  // formatNumberAxisTickChartTypes = common.formatNumberAxisTickChartTypes;
  // formatNumberXAxisTickChartTypes = common.formatNumberXAxisTickChartTypes;
  // formatNumberYAxisTickChartTypes = common.formatNumberYAxisTickChartTypes;

  formatNumberExamples: any[] = constants.FORMAT_NUMBER_EXAMPLES.map(x => {
    let structState = this.structQuery.getValue();

    x.output = this.dataService.formatValue({
      value: x.input,
      formatNumber: x.id,
      fieldResult: common.FieldResultEnum.Number,
      currencyPrefix: structState.currencyPrefix,
      currencySuffix: structState.currencySuffix
    });

    return x;
  });

  @Input()
  chart: common.MconfigChart;

  @Input()
  queryId: string;

  @Input()
  mconfigFields: common.MconfigField[];

  dimensionsMeasuresCalculations: common.MconfigField[];

  numbersDimensionsMeasuresCalculationsPlusEmpty: common.MconfigField[];
  numbersDimensionsMeasuresCalculations: common.MconfigField[];

  dimensions: common.MconfigField[];
  dimensionsPlusEmpty: common.MconfigField[];

  numbersMeasuresAndCalculations: common.MconfigField[];
  numbersMeasuresAndCalculationsPlusEmpty: common.MconfigField[];

  numbersYFields: common.MconfigField[];

  xFieldForm: FormGroup = this.fb.group({
    xField: [undefined]
  });

  yFieldForm: FormGroup = this.fb.group({
    yField: [undefined]
  });

  sizeFieldForm: FormGroup = this.fb.group({
    sizeField: [undefined]
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

  formatNumberDataLabelForm: FormGroup = this.fb.group({
    formatNumberDataLabel: [
      undefined,
      [ValidationService.formatNumberValidator, Validators.maxLength(255)]
    ]
  });

  formatNumberValueForm: FormGroup = this.fb.group({
    formatNumberValue: [
      undefined,
      [ValidationService.formatNumberValidator, Validators.maxLength(255)]
    ]
  });

  formatNumberAxisTickForm: FormGroup = this.fb.group({
    formatNumberAxisTick: [
      undefined,
      [ValidationService.formatNumberValidator, Validators.maxLength(255)]
    ]
  });

  formatNumberYAxisTickForm: FormGroup = this.fb.group({
    formatNumberYAxisTick: [
      undefined,
      [ValidationService.formatNumberValidator, Validators.maxLength(255)]
    ]
  });

  formatNumberXAxisTickForm: FormGroup = this.fb.group({
    formatNumberXAxisTick: [
      undefined,
      [ValidationService.formatNumberValidator, Validators.maxLength(255)]
    ]
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
      label: 'Soft',
      value: common.ChartColorSchemeEnum.Soft
    },
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
    private structQuery: StructQuery,
    private mconfigService: MconfigService,
    private dataService: DataService,
    private formatNumberService: FormatNumberService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);

    if (common.isUndefined(this.mconfigFields)) {
      return;
    }

    this.dimensionsMeasuresCalculations = this.mconfigFields.filter(
      x =>
        [
          common.FieldClassEnum.Dimension,
          common.FieldClassEnum.Measure,
          common.FieldClassEnum.Calculation
        ].indexOf(x.fieldClass) > -1
    );

    this.numbersDimensionsMeasuresCalculations = this.mconfigFields.filter(
      x =>
        x.result === common.FieldResultEnum.Number &&
        [
          common.FieldClassEnum.Dimension,
          common.FieldClassEnum.Measure,
          common.FieldClassEnum.Calculation
        ].indexOf(x.fieldClass) > -1
    );

    this.numbersDimensionsMeasuresCalculationsPlusEmpty = [
      constants.EMPTY_MCONFIG_FIELD,
      ...this.numbersDimensionsMeasuresCalculations
    ];

    this.dimensions = this.mconfigFields.filter(
      x => x.fieldClass === common.FieldClassEnum.Dimension
    );

    this.dimensionsPlusEmpty = [
      constants.EMPTY_MCONFIG_FIELD,
      ...this.dimensions
    ];

    this.numbersMeasuresAndCalculations = this.mconfigFields.filter(
      x =>
        x.result === common.FieldResultEnum.Number &&
        (x.fieldClass === common.FieldClassEnum.Measure ||
          x.fieldClass === common.FieldClassEnum.Calculation)
    );

    this.numbersMeasuresAndCalculationsPlusEmpty = [
      constants.EMPTY_MCONFIG_FIELD,
      ...this.numbersMeasuresAndCalculations
    ];

    this.numbersYFields =
      this.chart.type === common.ChartTypeEnum.Scatter
        ? this.numbersDimensionsMeasuresCalculations
        : this.numbersMeasuresAndCalculations;

    setValueAndMark({
      control: this.xFieldForm.controls['xField'],
      value: this.chart.xField
    });

    setValueAndMark({
      control: this.yFieldForm.controls['yField'],
      value: this.chart.yFields.length > 0 ? this.chart.yFields[0] : undefined
    });

    setValueAndMark({
      control: this.sizeFieldForm.controls['sizeField'],
      value: this.chart.sizeField
    });

    setValueAndMark({
      control: this.multiFieldForm.controls['multiField'],
      value: this.chart.multiField
    });

    setValueAndMark({
      control: this.pageSizeForm.controls['pageSize'],
      value: this.chart.pageSize
    });

    // setValueAndMark({
    //   control: this.colorSchemeForm.controls['colorScheme'],
    //   value: this.chart.colorScheme
    // });

    // setValueAndMark({
    //   control: this.schemeTypeForm.controls['schemeType'],
    //   value: this.chart.schemeType
    // });

    // setValueAndMark({
    //   control: this.interpolationForm.controls['interpolation'],
    //   value: this.chart.interpolation
    // });

    // setValueAndMark({
    //   control: this.unitsForm.controls['units'],
    //   value: this.chart.units
    // });

    setValueAndMark({
      control: this.formatNumberDataLabelForm.controls['formatNumberDataLabel'],
      value: this.formatNumberService.getFormatNumberDataLabel({
        chart: this.chart,
        mconfigFields: this.mconfigFields
      }).formatNumber
    });

    // setValueAndMark({
    //   control: this.formatNumberValueForm.controls['formatNumberValue'],
    //   value: this.formatNumberService.getFormatNumberValue({
    //     chart: this.chart,
    //     mconfigFields: this.mconfigFields
    //   }).formatNumber
    // });

    // setValueAndMark({
    //   control: this.formatNumberAxisTickForm.controls['formatNumberAxisTick'],
    //   value: this.formatNumberService.getFormatNumberAxisTick({
    //     chart: this.chart,
    //     mconfigFields: this.mconfigFields
    //   }).formatNumber
    // });

    setValueAndMark({
      control: this.formatNumberYAxisTickForm.controls['formatNumberYAxisTick'],
      value: this.formatNumberService.getFormatNumberYAxisTick({
        chart: this.chart,
        mconfigFields: this.mconfigFields
      }).formatNumber
    });

    // setValueAndMark({
    //   control: this.formatNumberXAxisTickForm.controls['formatNumberXAxisTick'],
    //   value: this.formatNumberService.getFormatNumberXAxisTick({
    //     chart: this.chart,
    //     mconfigFields: this.mconfigFields
    //   }).formatNumber
    // });

    // setValueAndMark({
    //   control: this.angleSpanForm.controls['angleSpan'],
    //   value: this.chart.angleSpan
    // });

    // setValueAndMark({
    //   control: this.startAngleForm.controls['startAngle'],
    //   value: this.chart.startAngle
    // });

    // setValueAndMark({
    //   control: this.arcWidthForm.controls['arcWidth'],
    //   value: this.chart.arcWidth
    // });

    // setValueAndMark({
    //   control: this.minForm.controls['min'],
    //   value: this.chart.min
    // });

    // setValueAndMark({
    //   control: this.maxForm.controls['max'],
    //   value: this.chart.max
    // });

    // setValueAndMark({
    //   control: this.xScaleMaxForm.controls['xScaleMax'],
    //   value: this.chart.xScaleMax
    // });

    // setValueAndMark({
    //   control: this.yScaleMinForm.controls['yScaleMin'],
    //   value: this.chart.yScaleMin
    // });

    // setValueAndMark({
    //   control: this.yScaleMaxForm.controls['yScaleMax'],
    //   value: this.chart.yScaleMax
    // });

    // setValueAndMark({
    //   control: this.barPaddingForm.controls['barPadding'],
    //   value: this.chart.barPadding
    // });

    // setValueAndMark({
    //   control: this.bigSegmentsForm.controls['bigSegments'],
    //   value: this.chart.bigSegments
    // });

    // setValueAndMark({
    //   control: this.smallSegmentsForm.controls['smallSegments'],
    //   value: this.chart.smallSegments
    // });

    // setValueAndMark({
    //   control: this.groupPaddingForm.controls['groupPadding'],
    //   value: this.chart.groupPadding
    // });

    // setValueAndMark({
    //   control: this.innerPaddingForm.controls['innerPadding'],
    //   value: this.chart.innerPadding
    // });

    // setValueAndMark({
    //   control: this.legendTitleForm.controls['legendTitle'],
    //   value: this.chart.legendTitle
    // });

    // setValueAndMark({
    //   control: this.xAxisLabelForm.controls['xAxisLabel'],
    //   value: this.chart.xAxisLabel
    // });

    // setValueAndMark({
    //   control: this.yAxisLabelForm.controls['yAxisLabel'],
    //   value: this.chart.yAxisLabel
    // });
  }

  getIsValid() {
    let isChartValid = false;

    if (this.chart.type === common.ChartTypeEnum.Table) {
      isChartValid = this.pageSizeForm.controls['pageSize'].valid;
    }
    // else if (this.chart.type === common.ChartTypeEnum.BarVertical) {
    //   isChartValid =
    //     (this.chart.legend === false ||
    //       this.legendTitleForm.controls['legendTitle'].valid) &&
    //     (this.chart.xAxis === false ||
    //       this.chart.showXAxisLabel === false ||
    //       this.xAxisLabelForm.controls['xAxisLabel'].valid) &&
    //     (this.chart.yAxis === false ||
    //       this.chart.showYAxisLabel === false ||
    //       this.yAxisLabelForm.controls['yAxisLabel'].valid) &&
    //     this.yScaleMaxForm.controls['yScaleMax'].valid &&
    //     this.barPaddingForm.controls['barPadding'].valid &&
    //     this.formatNumberDataLabelForm.controls['formatNumberDataLabel']
    //       .valid &&
    //     this.formatNumberYAxisTickForm.controls['formatNumberYAxisTick'].valid;
    // }
    else {
      isChartValid = true;
    }

    return isChartValid;
  }

  updateMconfig(newMconfig: common.MconfigX) {
    let isValid = this.getIsValid();
    if (isValid === true) {
      newMconfig.chart.isValid = true;

      this.mconfigService.navCreateTempMconfig({
        newMconfig: newMconfig
      });
    }
  }

  // unitsBlur() {
  //   let units = this.unitsForm.controls['units'].value;

  //   if (units === this.chart.units) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.units = units;
  //   this.updateMconfig(newMconfig);
  // }

  // formatNumberDataLabelBlur() {
  //   let formatNumberDataLabel =
  //     this.formatNumberDataLabelForm.controls['formatNumberDataLabel'].value;

  //   if (formatNumberDataLabel === this.chart.formatNumberDataLabel) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.formatNumberDataLabel = formatNumberDataLabel;
  //   this.updateMconfig(newMconfig);
  // }

  // formatNumberValueBlur() {
  //   let formatNumberValue =
  //     this.formatNumberValueForm.controls['formatNumberValue'].value;

  //   if (formatNumberValue === this.chart.formatNumberValue) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.formatNumberValue = formatNumberValue;
  //   this.updateMconfig(newMconfig);
  // }

  // formatNumberAxisTickBlur() {
  //   let formatNumberAxisTick =
  //     this.formatNumberAxisTickForm.controls['formatNumberAxisTick'].value;

  //   if (formatNumberAxisTick === this.chart.formatNumberAxisTick) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.formatNumberAxisTick = formatNumberAxisTick;
  //   this.updateMconfig(newMconfig);
  // }

  // formatNumberYAxisTickBlur() {
  //   let formatNumberYAxisTick =
  //     this.formatNumberYAxisTickForm.controls['formatNumberYAxisTick'].value;

  //   if (formatNumberYAxisTick === this.chart.formatNumberYAxisTick) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.formatNumberYAxisTick = formatNumberYAxisTick;
  //   this.updateMconfig(newMconfig);
  // }

  // formatNumberXAxisTickBlur() {
  //   let formatNumberXAxisTick =
  //     this.formatNumberXAxisTickForm.controls['formatNumberXAxisTick'].value;

  //   if (formatNumberXAxisTick === this.chart.formatNumberXAxisTick) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.formatNumberXAxisTick = formatNumberXAxisTick;
  //   this.updateMconfig(newMconfig);
  // }

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

  // angleSpanBlur() {
  //   let value = this.angleSpanForm.controls['angleSpan'].value;

  //   let angleSpan = common.isUndefinedOrEmpty(value)
  //     ? undefined
  //     : Number(value);

  //   if (
  //     common.isUndefined(angleSpan) &&
  //     common.isUndefined(this.chart.angleSpan)
  //   ) {
  //     return;
  //   }

  //   if (angleSpan === this.chart.angleSpan) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.angleSpan = angleSpan;
  //   this.updateMconfig(newMconfig);
  // }

  // startAngleBlur() {
  //   let value = this.startAngleForm.controls['startAngle'].value;

  //   let startAngle = common.isUndefinedOrEmpty(value)
  //     ? undefined
  //     : Number(value);

  //   if (
  //     common.isUndefined(startAngle) &&
  //     common.isUndefined(this.chart.startAngle)
  //   ) {
  //     return;
  //   }

  //   if (startAngle === this.chart.startAngle) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.startAngle = startAngle;
  //   this.updateMconfig(newMconfig);
  // }

  // arcWidthBlur() {
  //   let value = this.arcWidthForm.controls['arcWidth'].value;

  //   let arcWidth = common.isUndefinedOrEmpty(value) ? undefined : Number(value);

  //   if (
  //     common.isUndefined(arcWidth) &&
  //     common.isUndefined(this.chart.arcWidth)
  //   ) {
  //     return;
  //   }

  //   if (arcWidth === this.chart.arcWidth) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.arcWidth = arcWidth;
  //   this.updateMconfig(newMconfig);
  // }

  // minBlur() {
  //   let value = this.minForm.controls['min'].value;

  //   let min = common.isUndefinedOrEmpty(value) ? undefined : Number(value);

  //   if (common.isUndefined(min) && common.isUndefined(this.chart.min)) {
  //     return;
  //   }

  //   if (min === this.chart.min) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.min = min;
  //   this.updateMconfig(newMconfig);
  // }

  // maxBlur() {
  //   let value = this.maxForm.controls['max'].value;

  //   let max = common.isUndefinedOrEmpty(value) ? undefined : Number(value);

  //   if (common.isUndefined(max) && common.isUndefined(this.chart.max)) {
  //     return;
  //   }

  //   if (max === this.chart.max) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.max = max;
  //   this.updateMconfig(newMconfig);
  // }

  // xScaleMaxBlur() {
  //   let value = this.xScaleMaxForm.controls['xScaleMax'].value;

  //   let xScaleMax = common.isUndefinedOrEmpty(value)
  //     ? undefined
  //     : Number(value);

  //   if (
  //     common.isUndefined(xScaleMax) &&
  //     common.isUndefined(this.chart.xScaleMax)
  //   ) {
  //     return;
  //   }

  //   if (xScaleMax === this.chart.xScaleMax) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.xScaleMax = xScaleMax;
  //   this.updateMconfig(newMconfig);
  // }

  // yScaleMinBlur() {
  //   let value = this.yScaleMinForm.controls['yScaleMin'].value;

  //   let yScaleMin = common.isUndefinedOrEmpty(value)
  //     ? undefined
  //     : Number(value);

  //   if (
  //     common.isUndefined(yScaleMin) &&
  //     common.isUndefined(this.chart.yScaleMin)
  //   ) {
  //     return;
  //   }

  //   if (yScaleMin === this.chart.yScaleMin) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.yScaleMin = yScaleMin;
  //   this.updateMconfig(newMconfig);
  // }

  // yScaleMaxBlur() {
  //   let value = this.yScaleMaxForm.controls['yScaleMax'].value;

  //   let yScaleMax = common.isUndefinedOrEmpty(value)
  //     ? undefined
  //     : Number(value);

  //   if (
  //     common.isUndefined(yScaleMax) &&
  //     common.isUndefined(this.chart.yScaleMax)
  //   ) {
  //     return;
  //   }

  //   if (yScaleMax === this.chart.yScaleMax) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.yScaleMax = yScaleMax;
  //   this.updateMconfig(newMconfig);
  // }

  // barPaddingBlur() {
  //   let value = this.barPaddingForm.controls['barPadding'].value;

  //   let barPadding = common.isUndefinedOrEmpty(value)
  //     ? undefined
  //     : Number(value);

  //   if (
  //     common.isUndefined(barPadding) &&
  //     common.isUndefined(this.chart.barPadding)
  //   ) {
  //     return;
  //   }

  //   if (barPadding === this.chart.barPadding) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.barPadding = barPadding;
  //   this.updateMconfig(newMconfig);
  // }

  // bigSegmentsBlur() {
  //   let value = this.bigSegmentsForm.controls['bigSegments'].value;

  //   let bigSegments = common.isUndefinedOrEmpty(value)
  //     ? undefined
  //     : Number(value);

  //   if (
  //     common.isUndefined(bigSegments) &&
  //     common.isUndefined(this.chart.bigSegments)
  //   ) {
  //     return;
  //   }

  //   if (bigSegments === this.chart.bigSegments) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.bigSegments = bigSegments;
  //   this.updateMconfig(newMconfig);
  // }

  // smallSegmentsBlur() {
  //   let value = this.smallSegmentsForm.controls['smallSegments'].value;

  //   let smallSegments = common.isUndefinedOrEmpty(value)
  //     ? undefined
  //     : Number(value);

  //   if (
  //     common.isUndefined(smallSegments) &&
  //     common.isUndefined(this.chart.smallSegments)
  //   ) {
  //     return;
  //   }

  //   if (smallSegments === this.chart.smallSegments) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.smallSegments = smallSegments;
  //   this.updateMconfig(newMconfig);
  // }

  // groupPaddingBlur() {
  //   let value = this.groupPaddingForm.controls['groupPadding'].value;

  //   let groupPadding = common.isUndefinedOrEmpty(value)
  //     ? undefined
  //     : Number(value);

  //   if (
  //     common.isUndefined(groupPadding) &&
  //     common.isUndefined(this.chart.groupPadding)
  //   ) {
  //     return;
  //   }

  //   if (groupPadding === this.chart.groupPadding) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.groupPadding = groupPadding;
  //   this.updateMconfig(newMconfig);
  // }

  // innerPaddingBlur() {
  //   let value = this.innerPaddingForm.controls['innerPadding'].value;

  //   let innerPadding = common.isUndefinedOrEmpty(value)
  //     ? undefined
  //     : Number(value);

  //   if (
  //     common.isUndefined(innerPadding) &&
  //     common.isUndefined(this.chart.innerPadding)
  //   ) {
  //     return;
  //   }

  //   if (innerPadding === this.chart.innerPadding) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.innerPadding = innerPadding;
  //   this.updateMconfig(newMconfig);
  // }

  // legendTitleBlur() {
  //   let legendTitle = this.legendTitleForm.controls['legendTitle'].value;
  //   if (legendTitle === this.chart.legendTitle) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.legendTitle = legendTitle;
  //   this.updateMconfig(newMconfig);
  // }

  // xAxisLabelBlur() {
  //   let xAxisLabel = this.xAxisLabelForm.controls['xAxisLabel'].value;

  //   if (xAxisLabel === this.chart.xAxisLabel) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.xAxisLabel = xAxisLabel;
  //   this.updateMconfig(newMconfig);
  // }

  // yAxisLabelBlur() {
  //   let yAxisLabel = this.yAxisLabelForm.controls['yAxisLabel'].value;

  //   if (yAxisLabel === this.chart.yAxisLabel) {
  //     return;
  //   }

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.yAxisLabel = yAxisLabel;
  //   this.updateMconfig(newMconfig);
  // }

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
      common.multiFieldChartTypes.indexOf(newMconfig.chart.type) > -1 &&
      common.nullableMultiFieldChartTypes.indexOf(newMconfig.chart.type) < 0
    ) {
      let newMultiFieldValue = this.dimensions.filter(x => x.id !== xField)[0]
        .id;
      setValueAndMark({
        control: this.multiFieldForm.controls['multiField'],
        value: newMultiFieldValue
      });
      newMconfig.chart.multiField = newMultiFieldValue;
    }

    newMconfig.chart.xField = xField;
    this.mconfigService.navCreateTempMconfig({
      newMconfig: newMconfig
    });
  }

  yFieldChange() {
    let yField = this.yFieldForm.controls['yField'].value;

    let newMconfig = this.structService.makeMconfig();

    newMconfig.chart.yFields = [yField];

    this.mconfigService.navCreateTempMconfig({
      newMconfig: newMconfig
    });
  }

  sizeFieldChange() {
    let sizeField = this.sizeFieldForm.controls['sizeField'].value;
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.sizeField = sizeField;
    this.mconfigService.navCreateTempMconfig({
      newMconfig: newMconfig
    });
  }

  multiFieldChange() {
    let multiField = this.multiFieldForm.controls['multiField'].value;

    let newMconfig = this.structService.makeMconfig();

    // if (common.isDefinedAndNotEmpty(multiField)) {
    if (
      common.nullableMultiFieldChartTypes.indexOf(newMconfig.chart.type) < 0
    ) {
      let newXFieldValue = this.dimensions.filter(x => x.id !== multiField)[0]
        .id;

      setValueAndMark({
        control: this.xFieldForm.controls['xField'],
        value: newXFieldValue
      });

      newMconfig.chart.xField = newXFieldValue;
    }

    newMconfig.chart.multiField = multiField;
    this.mconfigService.navCreateTempMconfig({
      newMconfig: newMconfig
    });
  }

  // colorSchemeChange() {
  //   let colorScheme = this.colorSchemeForm.controls['colorScheme'].value;

  //   let newSchemeTypeValue: common.ChartSchemeTypeEnum =
  //     [
  //       common.ChartColorSchemeEnum.Solar,
  //       common.ChartColorSchemeEnum.Air,
  //       common.ChartColorSchemeEnum.Aqua
  //     ].indexOf(colorScheme) > -1
  //       ? common.ChartSchemeTypeEnum.Linear
  //       : common.ChartSchemeTypeEnum.Ordinal;

  //   setValueAndMark({
  //     control: this.schemeTypeForm.controls['schemeType'],
  //     value: newSchemeTypeValue
  //   });

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.colorScheme = colorScheme;
  //   newMconfig.chart.schemeType = newSchemeTypeValue;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // schemeTypeChange() {
  //   let schemeType = this.schemeTypeForm.controls['schemeType'].value;
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.schemeType = schemeType;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // interpolationChange() {
  //   let interpolation = this.interpolationForm.controls['interpolation'].value;
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.interpolation = interpolation;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // bandColorChange($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.bandColor = $event.color;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // cardColorChange($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.cardColor = $event.color;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // textColorChange($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.textColor = $event.color;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // emptyColorChange($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.emptyColor = $event.color;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleXAxis($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.xAxis = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleYAxis($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.yAxis = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleShowXAxisLabel($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.showXAxisLabel = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleShowYAxisLabel($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.showYAxisLabel = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleShowAxis($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.showAxis = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleAnimations($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.animations = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleGradient($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.gradient = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleLegend($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.legend = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleTooltipDisabled($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.tooltipDisabled = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleRoundEdges($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.roundEdges = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleRoundDomains($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.roundDomains = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleShowGridLines($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.showGridLines = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleTimeline($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.timeline = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleAutoScale($event: any) {
  //   setValueAndMark({
  //     control: this.yScaleMinForm.controls['yScaleMin'],
  //     value: null
  //   });

  //   setValueAndMark({
  //     control: this.yScaleMaxForm.controls['yScaleMax'],
  //     value: null
  //   });

  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.autoScale = $event;
  //   newMconfig.chart.yScaleMin = null;
  //   newMconfig.chart.yScaleMax = null;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleDoughnut($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.doughnut = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleExplodeSlices($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.explodeSlices = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleLabels($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.labels = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  // toggleShowDataLabel($event: any) {
  //   let newMconfig = this.structService.makeMconfig();
  //   newMconfig.chart.showDataLabel = $event;
  //   this.mconfigService.navCreateTempMconfig({
  //     newMconfig: newMconfig
  //   });
  // }

  toggleFormat() {
    let newMconfig = this.structService.makeMconfig();
    newMconfig.chart.format = !newMconfig.chart.format;
    this.mconfigService.navCreateTempMconfig({
      newMconfig: newMconfig
    });
  }
}
