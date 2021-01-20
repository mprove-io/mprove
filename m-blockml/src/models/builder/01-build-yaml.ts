import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { barYaml } from '../../barrels/bar-yaml';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../../models/bm-error';
import { ConfigService } from '@nestjs/config';

export function buildYaml(
  item: {
    errors: BmError[];
    files: api.File[];
    structId: string;
    weekStart: api.ProjectWeekStartEnum;
    connections: api.ProjectConnection[];
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let udfs: interfaces.Udf[];
  let views: interfaces.View[];
  let models: interfaces.Model[];
  let dashboards: interfaces.Dashboard[];
  let vizs: interfaces.Viz[];

  let file2s: interfaces.File2[] = barYaml.removeWrongExt(
    {
      files: item.files,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let file3s: interfaces.File3[] = barYaml.deduplicateFileNames(
    {
      file2s: file2s,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let filesAny: any[] = barYaml.yamlToObjects(
    {
      file3s: file3s,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = barYaml.makeLineNumbers(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = barYaml.checkTopUnknownParameters(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = barYaml.checkTopValues(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = barYaml.checkConnections(
    {
      filesAny: filesAny,
      connections: item.connections,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  filesAny = barYaml.checkSupportUdfs(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let splitFilesResult = barYaml.splitFiles(
    {
      filesAny: filesAny,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  udfs = splitFilesResult.udfs;
  views = splitFilesResult.views;
  models = splitFilesResult.models;
  dashboards = splitFilesResult.dashboards;
  vizs = splitFilesResult.vizs;

  return {
    udfs: udfs,
    views: views,
    models: models,
    dashboards: dashboards,
    vizs: vizs
  };
}
