import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.BuildViewModel;

export function buildViewModel(
  item: {
    views: common.FileView[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let viewModels: common.FileModel[] = [];

  let viewModelAlias = common.VIEW_MODEL_ALIAS;
  let viewModelPrefix = common.VIEW_MODEL_PREFIX;

  item.views.forEach(view => {
    let fileJoin: common.FileJoin = {
      from_view: view.name,
      from_view_line_num: 1,

      hidden: 'false',
      hidden_line_num: 1,

      label: undefined,
      label_line_num: 1,

      as: viewModelAlias,
      as_line_num: 1
    } as common.FileJoin;

    let viewModel: common.FileModel = {
      isViewModel: true,

      fileName: `${viewModelPrefix}_${view.fileName}`,
      fileExt: common.FileExtensionEnum.Model,
      filePath: view.filePath,
      name: `${viewModelPrefix}_${view.name}`,

      model: `${viewModelPrefix}_${view.name}`,
      model_line_num: 1,

      hidden: 'false',
      hidden_line_num: 1,

      label: `View Model - ${view.label}`,
      label_line_num: 1,

      group: undefined,
      group_line_num: undefined,

      description: view.description,
      description_line_num: 1,

      access_roles: view.access_roles,
      access_roles_line_num: 1,

      always_join: undefined,
      always_join_line_num: undefined,

      sql_always_where: undefined,
      sql_always_where_line_num: undefined,

      sql_always_where_calc: undefined,
      sql_always_where_calc_line_num: undefined,

      joins: [fileJoin],
      joins_line_num: 1,

      parameters: [],
      parameters_line_num: 1,

      build_metrics: common.isUndefined(view.build_metrics)
        ? []
        : view.build_metrics.map(x => {
            x.time = `${viewModelAlias}.${x.time}`;
            return x;
          }),
      build_metrics_line_num: 1,

      fields: [],
      fields_line_num: 1,

      udfs: [],
      udfs_line_num: 1,

      connection: view.connection
    };

    viewModels.push(viewModel);
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, viewModels);

  return viewModels;
}
