import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { barYaml } from '../../barrels/bar-yaml';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../../models/bm-error';

export function yamlBuild(item: {
  errors: BmError[];
  files: api.File[];
  structId: string;
  projectId: string;
  weekStart: api.ProjectWeekStartEnum;
  connections: api.ProjectConnection[];
  caller: enums.CallerEnum;
}) {
  let udfs: interfaces.Udf[];
  let views: interfaces.View[];
  let models: interfaces.Model[];
  let dashboards: interfaces.Dashboard[];
  let visualizations: interfaces.Visualization[];

  let file2s: interfaces.File2[] = barYaml.removeWrongExt({
    files: item.files,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  let file3s: interfaces.File3[] = barYaml.deduplicateFileNames({
    file2s: file2s,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  let filesAny: any[] = barYaml.yamlToObjects({
    file3s: file3s,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  filesAny = barYaml.makeLineNumbers({
    filesAny: filesAny,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  filesAny = barYaml.checkTopUnknownParameters({
    filesAny: filesAny,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  filesAny = barYaml.checkTopValues({
    filesAny: filesAny,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  filesAny = barYaml.checkConnections({
    filesAny: filesAny,
    connections: item.connections,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  filesAny = barYaml.checkSupportUdfs({
    filesAny: filesAny,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  let splitFilesResult = barYaml.splitFiles({
    filesAny: filesAny,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  udfs = splitFilesResult.udfs;
  views = splitFilesResult.views;
  models = splitFilesResult.models;
  dashboards = splitFilesResult.dashboards;
  visualizations = splitFilesResult.visualizations;

  return {
    udfs: udfs,
    views: views,
    models: models,
    dashboards: dashboards,
    visualizations: visualizations
  };
}
