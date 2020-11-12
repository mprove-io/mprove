import { api } from '../../barrels/api';
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
}) {
  let udfs: interfaces.Udf[];
  let views: interfaces.View[];
  let models: interfaces.Model[];
  let dashboards: interfaces.Dashboard[];
  let visualizations: interfaces.Visualization[];

  let file2s: interfaces.File2[] = barYaml.removeWrongExt({
    files: item.files,
    errors: item.errors,
    structId: item.structId
  });
  let file3s: interfaces.File3[] = barYaml.deduplicateFileNames({
    file2s: file2s,
    errors: item.errors,
    structId: item.structId
  });
  let filesAny: any[] = barYaml.yamlToObjects({
    file3s: file3s,
    errors: item.errors,
    structId: item.structId
  });
  filesAny = barYaml.makeLineNumbers({
    filesAny: filesAny,
    errors: item.errors,
    structId: item.structId
  });
  filesAny = barYaml.checkTopUnknownParameters({
    filesAny: filesAny,
    errors: item.errors,
    structId: item.structId
  });
  filesAny = barYaml.checkTopValues({
    filesAny: filesAny,
    errors: item.errors,
    structId: item.structId
  });
  filesAny = barYaml.checkConnections({
    filesAny: filesAny,
    connections: item.connections,
    errors: item.errors,
    structId: item.structId
  });

  filesAny = barYaml.checkSupportUdfs({
    filesAny: filesAny,
    errors: item.errors,
    structId: item.structId
  });

  let splitFilesResult = barYaml.splitFiles({
    filesAny: filesAny,
    errors: item.errors,
    structId: item.structId
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
