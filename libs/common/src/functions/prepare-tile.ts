import { DEFAULT_LIMIT, MALLOY_FILTER_ANY } from '#common/constants/top';
import { UI_CHART_TYPES } from '#common/constants/ui-chart-types';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { TileX } from '#common/interfaces/backend/tile-x';
import { FileFraction } from '#common/interfaces/blockml/internal/file-fraction';
import { FileFractionControl } from '#common/interfaces/blockml/internal/file-fraction-control';
import { FilePartTile } from '#common/interfaces/blockml/internal/file-part-tile';
import { FileTileParameter } from '#common/interfaces/blockml/internal/file-tile-parameter';
import { isDefined } from './is-defined';
import { toFileChartOptions } from './to-file-chart-options';

export function prepareTile(item: {
  tile?: TileX;
  mconfig: MconfigX;
  isForDashboard: boolean;
}): FilePartTile {
  let { tile, mconfig, isForDashboard } = item;

  let chart = mconfig.chart;

  let parameters: FileTileParameter[] = [];

  if (isDefined(mconfig.filters) && mconfig.filters.length > 0) {
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

  let filePartTile: FilePartTile = {
    title: chart.title,
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
