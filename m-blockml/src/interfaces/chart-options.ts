import { api } from '../barrels/api';

export interface ChartOptions {
  animations: string; // boolean
  animationsLineNum: number;

  gradient: string; // boolean
  gradientLineNum: number;

  legend: string; // boolean
  legendLineNum: number;

  legendTitle: string;
  legendTitleLineNum: number;

  tooltipDisabled: string; // boolean
  tooltipDisabledLineNum: number;

  roundEdges: string; // boolean
  roundEdgesLineNum: number;

  roundDomains: string; // boolean
  roundDomainsLineNum: number;

  showGridLines: string; // boolean
  showGridLinesLineNum: number;

  timeline: string; // boolean
  timelineLineNum: number;

  interpolation: api.ChartInterpolationEnum;
  interpolationLineNum: number;

  autoScale: string; // boolean
  autoScaleLineNum: number;

  doughnut: string; // boolean
  doughnutLineNum: number;

  explodeSlices: string; // boolean
  explodeSlicesLineNum: number;

  labels: string; // boolean
  labelsLineNum: number;

  colorScheme: api.ChartColorSchemeEnum;
  colorSchemeLineNum: number;

  schemeType: api.ChartSchemeTypeEnum;
  schemeTypeLineNum: number;

  pageSize: string;
  pageSizeLineNum: number;

  arcWidth: string;
  arcWidthLineNum: number;

  barPadding: string;
  barPaddingLineNum: number;

  groupPadding: string;
  groupPaddingLineNum: number;

  innerPadding: string;
  innerPaddingLineNum: number;

  rangeFillOpacity: string;
  rangeFillOpacityLineNum: number;

  angleSpan: string;
  angleSpanLineNum: number;

  startAngle: string;
  startAngleLineNum: number;

  bigSegments: string;
  bigSegmentsLineNum: number;

  smallSegments: string;
  smallSegmentsLineNum: number;

  min: string;
  minLineNum: number;

  max: string;
  maxLineNum: number;

  units: string;
  unitsLineNum: number;

  yScaleMin: string;
  yScaleMinLineNum: number;

  xScaleMax: string;
  xScaleMaxLineNum: number;

  yScaleMax: string;
  yScaleMaxLineNum: number;

  bandColor: string;
  bandColorLineNum: number;

  cardColor: string;
  cardColorLineNum: number;

  textColor: string;
  textColorLineNum: number;

  emptyColor: string;
  emptyColorLineNum: number;
}
