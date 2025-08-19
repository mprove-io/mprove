import { DEFAULT_LIMIT, MALLOY_FILTER_ANY } from '~common/constants/top';
import { UI_CHART_TYPES } from '~common/constants/ui-chart-types';
import { ControlClassEnum } from '~common/enums/control-class.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { TileX } from '~common/interfaces/backend/tile-x';
import { FileFraction } from '~common/interfaces/blockml/internal/file-fraction';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';
import { FilePartTile } from '~common/interfaces/blockml/internal/file-part-tile';
import { FileTileParameter } from '~common/interfaces/blockml/internal/file-tile-parameter';
import { isDefined } from './is-defined';
import { toFileChartOptions } from './to-file-chart-options';

export function prepareTile(item: {
  tile?: TileX;
  mconfig: MconfigX;
  isForDashboard: boolean;
  // malloyQueryId: string;
}): FilePartTile {
  let {
    tile,
    mconfig,
    isForDashboard
    // , malloyQueryId
  } = item;

  let chart = mconfig.chart;

  let parameters: FileTileParameter[] = [];

  if (
    // (mconfig.modelType === ModelTypeEnum.Store ||
    //   mconfig.modelType === ModelTypeEnum.SQL) &&
    isDefined(mconfig.filters) &&
    mconfig.filters.length > 0
  ) {
    mconfig.filters.forEach(x => {
      let parameter: FileTileParameter = {
        apply_to: x.fieldId
      };

      if (mconfig.modelType === ModelTypeEnum.Store) {
        parameter.fractions = x.fractions.map(mconfigFraction => {
          let fileFraction: FileFraction = {};

          if (isDefined(mconfigFraction.logicGroup)) {
            fileFraction.logic = mconfigFraction.logicGroup;
          }

          if (isDefined(mconfigFraction.storeFractionSubType)) {
            fileFraction.type = mconfigFraction.storeFractionSubType;
          }

          fileFraction.controls = mconfigFraction.controls.map(
            mconfigControl => {
              let newFileControl: FileFractionControl = {};

              if (mconfigControl.controlClass === ControlClassEnum.Input) {
                newFileControl.input = mconfigControl.name;
              } else if (
                mconfigControl.controlClass === ControlClassEnum.ListInput
              ) {
                newFileControl.list_input = mconfigControl.name;
              } else if (
                mconfigControl.controlClass === ControlClassEnum.Switch
              ) {
                newFileControl.switch = mconfigControl.name;
              } else if (
                mconfigControl.controlClass === ControlClassEnum.DatePicker
              ) {
                newFileControl.date_picker = mconfigControl.name;
              } else if (
                mconfigControl.controlClass === ControlClassEnum.Selector
              ) {
                newFileControl.selector = mconfigControl.name;
              }

              newFileControl.value = mconfigControl.value;

              return newFileControl;
            }
          );

          return fileFraction;
        });
      } else if (mconfig.modelType === ModelTypeEnum.Malloy) {
        //   parameter.conditions = x.fractions.map(fraction => fraction.brick);

        let parentsBricksNoAny = x.fractions
          .filter(
            fraction =>
              isDefined(fraction.parentBrick) &&
              fraction.parentBrick !== MALLOY_FILTER_ANY
          )
          .map(fraction => fraction.parentBrick);

        let parentBricksAny = x.fractions
          .filter(
            fraction =>
              isDefined(fraction.parentBrick) &&
              fraction.parentBrick === MALLOY_FILTER_ANY
          )
          .map(fraction => fraction.parentBrick);

        parameter.conditions = [
          ...new Set(parentsBricksNoAny),
          ...parentBricksAny
        ];
      }

      parameters.push(parameter);
    });
  }

  if (
    isForDashboard === true &&
    isDefined(tile) &&
    isDefined(tile.listen) &&
    Object.keys(tile.listen).length > 0
  ) {
    Object.keys(tile.listen).forEach(x => {
      let dashboardFieldName = tile.listen[x];

      let parameter = parameters.find(p => p.apply_to === x);

      if (isDefined(parameter)) {
        parameter.listen = dashboardFieldName;
        parameter.conditions = undefined;
        parameter.fractions = undefined;
      } else {
        parameter = {
          apply_to: x,
          listen: dashboardFieldName
        };
        parameters.push(parameter);
      }
    });
  }

  let data = {
    x_field:
      UI_CHART_TYPES.xField.indexOf(chart.type) > -1 && isDefined(chart.xField)
        ? chart.xField
        : undefined,
    y_fields:
      (UI_CHART_TYPES.yFields.indexOf(chart.type) > -1 ||
        UI_CHART_TYPES.yField.indexOf(chart.type) > -1) &&
      isDefined(chart.yFields) &&
      chart.yFields.length > 0
        ? chart.yFields
        : undefined,
    hide_columns:
      UI_CHART_TYPES.hideColumns.indexOf(chart.type) > -1 &&
      isDefined(chart.hideColumns) &&
      chart.hideColumns.length > 0
        ? chart.hideColumns
        : undefined,
    multi_field:
      UI_CHART_TYPES.multiField.indexOf(chart.type) > -1 &&
      isDefined(chart.multiField)
        ? chart.multiField
        : undefined,
    size_field:
      UI_CHART_TYPES.sizeField.indexOf(chart.type) > -1 &&
      isDefined(chart.sizeField)
        ? chart.sizeField
        : undefined
  };

  let filePartTile: FilePartTile =
    // mconfig.modelType === ModelTypeEnum.Malloy
    //   ? {
    //       title: chart.title,
    //       description: isDefined(chart.description)
    //         ? chart.description
    //         : undefined,
    //       query: malloyQueryId,
    //       parameters:
    //         Object.keys(parameters).length > 0 ? parameters : undefined,
    //       type: chart.type,
    //       data: data,
    //       options: {},
    //       plate: {}
    //     }
    // :
    {
      title: chart.title,
      description: isDefined(chart.description) ? chart.description : undefined,
      model: mconfig.modelId,
      select: mconfig.select,
      sorts: isDefined(mconfig.sorts) ? mconfig.sorts : undefined,
      limit:
        isDefined(mconfig.limit) && mconfig.limit !== Number(DEFAULT_LIMIT)
          ? <any>mconfig.limit
          : undefined,
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
      type: chart.type,
      data: data,
      options: {},
      plate: {}
    };

  filePartTile.options = toFileChartOptions({
    chart: chart,
    isReport: false
  });

  if (isForDashboard === true && isDefined(tile)) {
    filePartTile.plate = {
      plate_width: isDefined(tile.plateWidth)
        ? <any>tile.plateWidth
        : undefined,
      plate_height: isDefined(tile.plateHeight)
        ? <any>tile.plateHeight
        : undefined,
      plate_x: isDefined(tile.plateX) ? <any>tile.plateX : undefined,
      plate_y: isDefined(tile.plateY) ? <any>tile.plateY : undefined
    };
  }

  //

  let keepData = false;
  Object.keys(filePartTile.data).forEach((x: any) => {
    if (isDefined((<any>filePartTile.data)[x])) {
      keepData = true;
    }
  });
  if (keepData === false) {
    delete filePartTile.data;
  }

  //

  let keepOptions = false;
  Object.keys(filePartTile.options).forEach((x: any) => {
    if (isDefined((<any>filePartTile.options)[x])) {
      keepOptions = true;
    }
  });
  if (keepOptions === false) {
    delete filePartTile.options;
  }

  //

  let keepPlate = false;
  Object.keys(filePartTile.plate).forEach((x: any) => {
    if (isDefined((<any>filePartTile.plate)[x])) {
      keepPlate = true;
    }
  });
  if (keepPlate === false) {
    delete filePartTile.plate;
  }

  return filePartTile;
}

//
//
//

// axis: {
//   x_axis_label:
//     xAxisLabelChartTypes.indexOf(chart.type) > -1 &&
//     chart.xAxisLabel !== CHART_DEFAULT_X_AXIS_LABEL &&
//     isDefined(chart.xAxisLabel)
//       ? chart.xAxisLabel
//       : undefined,
//   y_axis_label:
//     yAxisLabelChartTypes.indexOf(chart.type) > -1 &&
//     chart.yAxisLabel !== CHART_DEFAULT_Y_AXIS_LABEL &&
//     isDefined(chart.yAxisLabel)
//       ? chart.yAxisLabel
//       : undefined,
//   show_x_axis_label:
//     showXAxisLabelChartTypes.indexOf(chart.type) > -1 &&
//     chart.showXAxisLabel !== CHART_DEFAULT_SHOW_X_AXIS_LABEL &&
//     isDefined(chart.showXAxisLabel)
//       ? <any>chart.showXAxisLabel
//       : undefined,
//   show_y_axis_label:
//     showYAxisLabelChartTypes.indexOf(chart.type) > -1 &&
//     chart.showYAxisLabel !== CHART_DEFAULT_SHOW_Y_AXIS_LABEL &&
//     isDefined(chart.showYAxisLabel)
//       ? <any>chart.showYAxisLabel
//       : undefined,
//   x_axis:
//     xAxisChartTypes.indexOf(chart.type) > -1 &&
//     chart.xAxis !== CHART_DEFAULT_X_AXIS &&
//     isDefined(chart.xAxis)
//       ? <any>chart.xAxis
//       : undefined,
//   y_axis:
//     yAxisChartTypes.indexOf(chart.type) > -1 &&
//     chart.yAxis !== CHART_DEFAULT_Y_AXIS &&
//     isDefined(chart.yAxis)
//       ? <any>chart.yAxis
//       : undefined,
//   show_axis:
//     showAxisChartTypes.indexOf(chart.type) > -1 &&
//     chart.showAxis !== CHART_DEFAULT_SHOW_AXIS &&
//     isDefined(chart.showAxis)
//       ? <any>chart.showAxis
//       : undefined
// },

//
//
//

// color_scheme:
//   colorSchemeChartTypes.indexOf(chart.type) > -1 &&
//   chart.colorScheme !== CHART_DEFAULT_COLOR_SCHEME &&
//   isDefined(chart.colorScheme)
//     ? chart.colorScheme
//     : undefined,
// scheme_type:
//   schemeTypeChartTypes.indexOf(chart.type) > -1 &&
//   chart.schemeType !== CHART_DEFAULT_SCHEME_TYPE &&
//   isDefined(chart.schemeType)
//     ? chart.schemeType
//     : undefined,
// interpolation:
//   interpolationChartTypes.indexOf(chart.type) > -1 &&
//   chart.interpolation !== CHART_DEFAULT_INTERPOLATION &&
//   isDefined(chart.interpolation)
//     ? chart.interpolation
//     : undefined,
// card_color:
//   cardColorChartTypes.indexOf(chart.type) > -1 &&
//   chart.cardColor !== CHART_DEFAULT_CARD_COLOR &&
//   isDefined(chart.cardColor)
//     ? chart.cardColor
//     : undefined,
// empty_color:
//   emptyColorChartTypes.indexOf(chart.type) > -1 &&
//   chart.emptyColor !== CHART_DEFAULT_EMPTY_COLOR &&
//   isDefined(chart.emptyColor)
//     ? chart.emptyColor
//     : undefined,
// band_color:
//   bandColorChartTypes.indexOf(chart.type) > -1 &&
//   chart.bandColor !== CHART_DEFAULT_BAND_COLOR &&
//   isDefined(chart.bandColor)
//     ? chart.bandColor
//     : undefined,
// text_color:
//   textColorChartTypes.indexOf(chart.type) > -1 &&
//   chart.textColor !== CHART_DEFAULT_TEXT_COLOR &&
//   isDefined(chart.textColor)
//     ? chart.textColor
//     : undefined,
// units:
//   unitsChartTypes.indexOf(chart.type) > -1 &&
//   chart.units !== CHART_DEFAULT_UNITS &&
//   isDefined(chart.units)
//     ? chart.units
//     : undefined,
// legend_title:
//   legendTitleChartTypes.indexOf(chart.type) > -1 &&
//   chart.legendTitle !== CHART_DEFAULT_LEGEND_TITLE &&
//   isDefined(chart.legendTitle)
//     ? chart.legendTitle
//     : undefined,
// legend:
//   legendChartTypes.indexOf(chart.type) > -1 &&
//   chart.legend !== CHART_DEFAULT_LEGEND &&
//   isDefined(chart.legend)
//     ? <any>chart.legend
//     : undefined,
// labels:
//   labelsChartTypes.indexOf(chart.type) > -1 &&
//   chart.labels !== CHART_DEFAULT_LABELS &&
//   isDefined(chart.labels)
//     ? <any>chart.labels
//     : undefined,
// show_data_label:
//   showDataLabelChartTypes.indexOf(chart.type) > -1 &&
//   chart.showDataLabel !== CHART_DEFAULT_SHOW_DATA_LABEL &&
//   isDefined(chart.showDataLabel)
//     ? <any>chart.showDataLabel
//     : undefined,
// tooltip_disabled:
//   tooltipDisabledChartTypes.indexOf(chart.type) > -1 &&
//   chart.tooltipDisabled !== CHART_DEFAULT_TOOLTIP_DISABLED &&
//   isDefined(chart.tooltipDisabled)
//     ? <any>chart.tooltipDisabled
//     : undefined,
// round_edges:
//   roundEdgesChartTypes.indexOf(chart.type) > -1 &&
//   chart.roundEdges !== CHART_DEFAULT_ROUND_EDGES &&
//   isDefined(chart.roundEdges)
//     ? <any>chart.roundEdges
//     : undefined,
// round_domains:
//   roundDomainsChartTypes.indexOf(chart.type) > -1 &&
//   chart.roundDomains !== CHART_DEFAULT_ROUND_DOMAINS &&
//   isDefined(chart.roundDomains)
//     ? <any>chart.roundDomains
//     : undefined,
// show_grid_lines:
//   showGridLinesChartTypes.indexOf(chart.type) > -1 &&
//   chart.showGridLines !== CHART_DEFAULT_SHOW_GRID_LINES &&
//   isDefined(chart.showGridLines)
//     ? <any>chart.showGridLines
//     : undefined,
// auto_scale:
//   autoScaleChartTypes.indexOf(chart.type) > -1 &&
//   chart.autoScale !== CHART_DEFAULT_AUTO_SCALE &&
//   isDefined(chart.autoScale)
//     ? <any>chart.autoScale
//     : undefined,
// doughnut:
//   doughnutChartTypes.indexOf(chart.type) > -1 &&
//   chart.doughnut !== CHART_DEFAULT_DOUGHNUT &&
//   isDefined(chart.doughnut)
//     ? <any>chart.doughnut
//     : undefined,
// explode_slices:
//   explodeSlicesChartTypes.indexOf(chart.type) > -1 &&
//   chart.explodeSlices !== CHART_DEFAULT_EXPLODE_SLICES &&
//   isDefined(chart.explodeSlices)
//     ? <any>chart.explodeSlices
//     : undefined,
// gradient:
//   gradientChartTypes.indexOf(chart.type) > -1 &&
//   chart.gradient !== CHART_DEFAULT_GRADIENT &&
//   isDefined(chart.gradient)
//     ? <any>chart.gradient
//     : undefined,
// animations:
//   animationsChartTypes.indexOf(chart.type) > -1 &&
//   chart.animations !== CHART_DEFAULT_ANIMATIONS &&
//   isDefined(chart.animations)
//     ? <any>chart.animations
//     : undefined,
// arc_width:
//   arcWidthChartTypes.indexOf(chart.type) > -1 &&
//   chart.arcWidth !== CHART_DEFAULT_ARC_WIDTH &&
//   isDefined(chart.arcWidth)
//     ? <any>chart.arcWidth
//     : undefined,
// bar_padding:
//   barPaddingChartTypes.indexOf(chart.type) > -1 &&
//   chart.barPadding !== CHART_DEFAULT_BAR_PADDING &&
//   isDefined(chart.barPadding)
//     ? <any>chart.barPadding
//     : undefined,
// group_padding:
//   groupPaddingChartTypes.indexOf(chart.type) > -1 &&
//   chart.groupPadding !== CHART_DEFAULT_GROUP_PADDING &&
//   isDefined(chart.groupPadding)
//     ? <any>chart.groupPadding
//     : undefined,
// inner_padding:
//   innerPaddingChartTypes.indexOf(chart.type) > -1 &&
//   chart.innerPadding !== CHART_DEFAULT_INNER_PADDING &&
//   isDefined(chart.innerPadding)
//     ? <any>chart.innerPadding
//     : undefined,
// angle_span:
//   angleSpanChartTypes.indexOf(chart.type) > -1 &&
//   chart.angleSpan !== CHART_DEFAULT_ANGLE_SPAN &&
//   isDefined(chart.angleSpan)
//     ? <any>chart.angleSpan
//     : undefined,
// start_angle:
//   startAngleChartTypes.indexOf(chart.type) > -1 &&
//   chart.startAngle !== CHART_DEFAULT_START_ANGLE &&
//   isDefined(chart.startAngle)
//     ? <any>chart.startAngle
//     : undefined,
// big_segments:
//   bigSegmentsChartTypes.indexOf(chart.type) > -1 &&
//   chart.bigSegments !== CHART_DEFAULT_BIG_SEGMENTS &&
//   isDefined(chart.bigSegments)
//     ? <any>chart.bigSegments
//     : undefined,
// small_segments:
//   smallSegmentsChartTypes.indexOf(chart.type) > -1 &&
//   chart.smallSegments !== CHART_DEFAULT_SMALL_SEGMENTS &&
//   isDefined(chart.smallSegments)
//     ? <any>chart.smallSegments
//     : undefined,
// min:
//   minChartTypes.indexOf(chart.type) > -1 &&
//   chart.min !== CHART_DEFAULT_MIN &&
//   isDefined(chart.min)
//     ? <any>chart.min
//     : undefined,
// max:
//   maxChartTypes.indexOf(chart.type) > -1 &&
//   chart.max !== CHART_DEFAULT_MAX &&
//   isDefined(chart.max)
//     ? <any>chart.max
//     : undefined,

// y_scale_min:
//   yScaleMinChartTypes.indexOf(chart.type) > -1 &&
//   chart.yScaleMin !== CHART_DEFAULT_Y_SCALE_MIN &&
//   isDefined(chart.yScaleMin)
//     ? <any>chart.yScaleMin
//     : undefined,
// y_scale_max:
//   yScaleMaxChartTypes.indexOf(chart.type) > -1 &&
//   chart.yScaleMax !== CHART_DEFAULT_Y_SCALE_MAX &&
//   isDefined(chart.yScaleMax)
//     ? <any>chart.yScaleMax
//     : undefined,
// x_scale_max:
//   xScaleMaxChartTypes.indexOf(chart.type) > -1 &&
//   chart.xScaleMax !== CHART_DEFAULT_X_SCALE_MAX &&
//   isDefined(chart.xScaleMax)
//     ? <any>chart.xScaleMax
//     : undefined,

// format_number_data_label:
//   formatNumberDataLabelChartTypes.indexOf(chart.type) > -1 &&
//   isDefined(chart.formatNumberDataLabel)
//     ? chart.formatNumberDataLabel
//     : undefined,

// format_number_value:
//   formatNumberValueChartTypes.indexOf(chart.type) > -1 &&
//   isDefined(chart.formatNumberValue)
//     ? chart.formatNumberValue
//     : undefined,

// format_number_axis_tick:
//   formatNumberAxisTickChartTypes.indexOf(chart.type) > -1 &&
//   isDefined(chart.formatNumberAxisTick)
//     ? chart.formatNumberAxisTick
//     : undefined,

// format_number_y_axis_tick:
//   formatNumberYAxisTickChartTypes.indexOf(chart.type) > -1 &&
//   isDefined(chart.formatNumberYAxisTick)
//     ? chart.formatNumberYAxisTick
//     : undefined,

// format_number_x_axis_tick:
//   formatNumberXAxisTickChartTypes.indexOf(chart.type) > -1 &&
//   isDefined(chart.formatNumberXAxisTick)
//     ? chart.formatNumberXAxisTick
//     : undefined

// timeline:
//   timelineChartTypes.indexOf(chart.type) > -1 &&
//   chart.timeline !== CHART_DEFAULT_TIMELINE &&
//   isDefined()
//     ? chart.timeline
//     : undefined,
// range_fill_opacity:
//   rangeFillOpacityChartTypes.indexOf(chart.type) > -1 &&
//   chart.rangeFillOpacity !== CHART_DEFAULT_RANGE_FILL_OPACITY &&
//   isDefined()
//     ? chart.rangeFillOpacity
//     : undefined,
