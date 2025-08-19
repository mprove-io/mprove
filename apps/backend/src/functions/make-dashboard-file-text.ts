import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FileFraction } from '~common/interfaces/blockml/internal/file-fraction';
import { getYYYYMMDDCurrentDateByTimezone } from '~node-common/functions/get-yyyymmdd-current-date-by-timezone';

interface MalloyPart {
  modelId: string;
  malloyQueryText: string;
  modelRelativePath: string;
}

export function makeDashboardFileText(item: {
  dashboard: DashboardX;
  newDashboardId: string;
  newTitle: string;
  // group: string;
  roles: string;
  timezone: string;
  caseSensitiveStringFilters: boolean;
  // malloyDashboardFilePath: string;
}) {
  let {
    dashboard,
    newDashboardId,
    newTitle,
    roles,
    timezone,
    caseSensitiveStringFilters
    // malloyDashboardFilePath
  } = item;

  let malloyParts: MalloyPart[] = [];

  let dashboardFile: FileDashboard = {
    fileName: undefined,
    fileExt: undefined,
    filePath: undefined,
    name: undefined,
    dashboard: newDashboardId,
    title: isDefined(newTitle) ? newTitle.trim() : undefined,
    description: isDefined(dashboard.description)
      ? dashboard.description
      : undefined,
    // group:
    //   isDefined(group) && group.trim().length > 0
    //     ? group.trim()
    //     : undefined,
    access_roles:
      isDefined(roles) && roles.trim().length > 0
        ? roles.split(',').map(x => x.trim())
        : undefined,
    parameters:
      isDefined(dashboard.fields) && dashboard.fields.length > 0
        ? dashboard.fields.map(field => {
            let fileField: FieldFilter = {
              filter: field.id,
              hidden:
                isDefined(field.hidden) &&
                field.hidden !== DASHBOARD_FIELD_DEFAULT_HIDDEN
                  ? <any>field.hidden
                  : undefined,
              label:
                isDefined(field.label) &&
                field.label.toUpperCase() !==
                  MyRegex.replaceUnderscoresWithSpaces(field.id).toUpperCase()
                  ? field.label
                  : undefined,
              description:
                isDefined(field.description) && field.description !== ''
                  ? field.description
                  : undefined,
              result: field.result,
              store_model: field.storeModel,
              store_result: field.storeResult,
              store_filter: field.storeFilter,
              fractions: isUndefined(field.storeModel)
                ? undefined
                : field.fractions?.map(mconfigFraction => {
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

                        if (
                          mconfigControl.controlClass === ControlClassEnum.Input
                        ) {
                          newFileControl.input = mconfigControl.name;
                        } else if (
                          mconfigControl.controlClass ===
                          ControlClassEnum.ListInput
                        ) {
                          newFileControl.list_input = mconfigControl.name;
                        } else if (
                          mconfigControl.controlClass ===
                          ControlClassEnum.Switch
                        ) {
                          newFileControl.switch = mconfigControl.name;
                        } else if (
                          mconfigControl.controlClass ===
                          ControlClassEnum.DatePicker
                        ) {
                          newFileControl.date_picker = mconfigControl.name;
                        } else if (
                          mconfigControl.controlClass ===
                          ControlClassEnum.Selector
                        ) {
                          newFileControl.selector = mconfigControl.name;
                        }

                        let newValue = mconfigControl.value;

                        let reg = MyRegex.CAPTURE_S_REF();

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

                          newValue = MyRegex.replaceSRefs(
                            newValue,
                            reference,
                            target
                          );
                        }

                        newFileControl.value =
                          newFileControl.controlClass ===
                            ControlClassEnum.Switch &&
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
                isUndefined(field.storeModel) &&
                isDefined(field.fractions) &&
                field.fractions.length > 0
                  ? field.fractions.map(x => x.brick)
                  : undefined
            };

            return fileField;
          })
        : undefined,
    tiles:
      isDefined(dashboard.tiles) && dashboard.tiles.length > 0
        ? dashboard.tiles.map((x, tileIndex) => {
            let newMconfig = makeCopy(x.mconfig);

            // if (isUndefined(x.malloyQueryId)) {
            //   x.malloyQueryId = makeId();
            // }

            let filePartTile: FilePartTile = prepareTile({
              tile: x,
              isForDashboard: true,
              mconfig: newMconfig
              // malloyQueryId: x.malloyQueryId
            });

            // if (newMconfig.modelType === ModelTypeEnum.Malloy) {
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

  let dashboardFileText = toYaml(dashboardFile);

  // console.log('dashboardFileText');
  // console.log(dashboardFileText);

  // let malloyFileText: string;

  // if (malloyParts.length > 0) {
  //   malloyFileText = '';

  //   let uniqueModelIds = [
  //     ...new Set(malloyParts.map(malloyPart => malloyPart.modelId))
  //   ];

  //   malloyFileText = uniqueModelIds
  //     .map(modelId => {
  //       let malloyPart = malloyParts.find(y => y.modelId === modelId);
  //       return `import { ${modelId} } from '${malloyPart.modelRelativePath}';`;
  //     })
  //     .join('\n');

  //   malloyFileText = [
  //     `${malloyFileText}\n`,
  //     ...malloyParts.map(x => x.malloyQueryText)
  //   ].join('\n');
  // }

  return {
    dashboardFileText: dashboardFileText
    // malloyFileText: malloyFileText
  };
}
