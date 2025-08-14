import { common } from '~backend/barrels/common';
import { enums } from '~common/barrels/enums';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FileFraction } from '~common/interfaces/blockml/internal/file-fraction';
import { getYYYYMMDDCurrentDateByTimezone } from '~node-common/functions/get-yyyymmdd-current-date-by-timezone';

interface MalloyPart {
  modelId: string;
  malloyQueryText: string;
  modelRelativePath: string;
}

export function makeDashboardFileText(item: {
  dashboard: common.DashboardX;
  newDashboardId: string;
  newTitle: string;
  // group: string;
  roles: string;
  timezone: string;
  caseSensitiveStringFilters: boolean;
  malloyDashboardFilePath: string;
}) {
  let {
    dashboard,
    newDashboardId,
    newTitle,
    roles,
    timezone,
    caseSensitiveStringFilters,
    malloyDashboardFilePath
  } = item;

  let malloyParts: MalloyPart[] = [];

  let dashboardFile: common.FileDashboard = {
    fileName: undefined,
    fileExt: undefined,
    filePath: undefined,
    name: undefined,
    dashboard: newDashboardId,
    title: common.isDefined(newTitle) ? newTitle.trim() : undefined,
    description: common.isDefined(dashboard.description)
      ? dashboard.description
      : undefined,
    // group:
    //   common.isDefined(group) && group.trim().length > 0
    //     ? group.trim()
    //     : undefined,
    access_roles:
      common.isDefined(roles) && roles.trim().length > 0
        ? roles.split(',').map(x => x.trim())
        : undefined,
    parameters:
      common.isDefined(dashboard.fields) && dashboard.fields.length > 0
        ? dashboard.fields.map(field => {
            let fileField: common.FieldFilter = {
              filter: field.id,
              hidden:
                common.isDefined(field.hidden) &&
                field.hidden !== common.DASHBOARD_FIELD_DEFAULT_HIDDEN
                  ? <any>field.hidden
                  : undefined,
              label:
                common.isDefined(field.label) &&
                field.label.toUpperCase() !==
                  common.MyRegex.replaceUnderscoresWithSpaces(
                    field.id
                  ).toUpperCase()
                  ? field.label
                  : undefined,
              description:
                common.isDefined(field.description) && field.description !== ''
                  ? field.description
                  : undefined,
              result: field.result,
              store_model: field.storeModel,
              store_result: field.storeResult,
              store_filter: field.storeFilter,
              fractions: common.isUndefined(field.storeModel)
                ? undefined
                : field.fractions?.map(mconfigFraction => {
                    let fileFraction: FileFraction = {};

                    if (common.isDefined(mconfigFraction.logicGroup)) {
                      fileFraction.logic = mconfigFraction.logicGroup;
                    }

                    if (
                      common.isDefined(mconfigFraction.storeFractionSubType)
                    ) {
                      fileFraction.type = mconfigFraction.storeFractionSubType;
                    }

                    fileFraction.controls = mconfigFraction.controls.map(
                      mconfigControl => {
                        let newFileControl: common.FileFractionControl = {};

                        if (
                          mconfigControl.controlClass ===
                          enums.ControlClassEnum.Input
                        ) {
                          newFileControl.input = mconfigControl.name;
                        } else if (
                          mconfigControl.controlClass ===
                          enums.ControlClassEnum.ListInput
                        ) {
                          newFileControl.list_input = mconfigControl.name;
                        } else if (
                          mconfigControl.controlClass ===
                          enums.ControlClassEnum.Switch
                        ) {
                          newFileControl.switch = mconfigControl.name;
                        } else if (
                          mconfigControl.controlClass ===
                          enums.ControlClassEnum.DatePicker
                        ) {
                          newFileControl.date_picker = mconfigControl.name;
                        } else if (
                          mconfigControl.controlClass ===
                          enums.ControlClassEnum.Selector
                        ) {
                          newFileControl.selector = mconfigControl.name;
                        }

                        let newValue = mconfigControl.value;

                        let reg = common.MyRegex.CAPTURE_S_REF();

                        let r;

                        // let refError;

                        while ((r = reg.exec(newValue))) {
                          let reference = r[1];

                          let target: any;

                          if (reference === 'METRICS_DATE_FROM') {
                            target = getYYYYMMDDCurrentDateByTimezone({
                              timezone: timezone,
                              deltaDays: -1
                            });
                          } else if (reference === 'METRICS_DATE_TO') {
                            target = getYYYYMMDDCurrentDateByTimezone({
                              timezone: timezone,
                              deltaDays: +1
                            });
                          } else if (reference === 'DATE_TODAY') {
                            target = getYYYYMMDDCurrentDateByTimezone({
                              timezone: timezone,
                              deltaDays: 0
                            });
                          } else if (
                            reference === 'PROJECT_CONFIG_CASE_SENSITIVE'
                          ) {
                            target = caseSensitiveStringFilters;
                          } else {
                            target = null;
                            // refError = `Unknown reference in store.${storeParam}: $${reference}`;
                            // break;
                          }

                          newValue = common.MyRegex.replaceSRefs(
                            newValue,
                            reference,
                            target
                          );
                        }

                        newFileControl.value =
                          newFileControl.controlClass ===
                            common.ControlClassEnum.Switch &&
                          typeof newValue === 'string'
                            ? toBooleanFromLowercaseString(newValue)
                            : newValue;

                        // newFileControl.value = mconfigControl.value;

                        return newFileControl;
                      }
                    );

                    return fileFraction;
                  }),
              suggest_model_dimension: field.suggestModelDimension,
              conditions:
                common.isUndefined(field.storeModel) &&
                common.isDefined(field.fractions) &&
                field.fractions.length > 0
                  ? field.fractions.map(x => x.brick)
                  : undefined
            };

            return fileField;
          })
        : undefined,
    tiles:
      common.isDefined(dashboard.tiles) && dashboard.tiles.length > 0
        ? dashboard.tiles.map((x, tileIndex) => {
            let newMconfig = common.makeCopy(x.mconfig);

            // if (common.isUndefined(x.malloyQueryId)) {
            //   x.malloyQueryId = common.makeId();
            // }

            let filePartTile: common.FilePartTile = common.prepareTile({
              tile: x,
              isForDashboard: true,
              mconfig: newMconfig
              // malloyQueryId: x.malloyQueryId
            });

            // if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
            //   let modelRelativePath = path.relative(
            //     `/${path.dirname(malloyDashboardFilePath)}`,
            //     `/${newMconfig.modelFilePath}`
            //   );

            //   let malloyPart: MalloyPart = {
            //     modelId: newMconfig.modelId,
            //     modelRelativePath: modelRelativePath,
            //     malloyQueryText: `query: ${x.malloyQueryId} is ${newMconfig.malloyQuery.substring(5)}`
            //   };

            //   malloyParts.push(malloyPart);
            // }

            return filePartTile;
          })
        : undefined
  };

  let dashboardFileText = common.toYaml(dashboardFile);

  // console.log('dashboardFileText');
  // console.log(dashboardFileText);

  let malloyFileText: string;

  if (malloyParts.length > 0) {
    malloyFileText = '';

    let uniqueModelIds = [
      ...new Set(malloyParts.map(malloyPart => malloyPart.modelId))
    ];

    malloyFileText = uniqueModelIds
      .map(modelId => {
        let malloyPart = malloyParts.find(y => y.modelId === modelId);
        return `import { ${modelId} } from '${malloyPart.modelRelativePath}';`;
      })
      .join('\n');

    malloyFileText = [
      `${malloyFileText}\n`,
      ...malloyParts.map(x => x.malloyQueryText)
    ].join('\n');
  }

  return {
    dashboardFileText: dashboardFileText,
    malloyFileText: malloyFileText
  };
}
