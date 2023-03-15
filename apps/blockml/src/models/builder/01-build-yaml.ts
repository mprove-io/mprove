import { ConfigService } from '@nestjs/config';
import { barYaml } from '~blockml/barrels/bar-yaml';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildYaml(
  item: {
    errors: BmError[];
    files: common.BmlFile[];
    structId: string;
    connections: common.ProjectConnection[];
    mproveDir: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let udfs: common.FileUdf[];
  let views: common.FileView[];
  let models: common.FileModel[];
  let dashboards: common.FileDashboard[];
  let reps: common.FileRep[];
  let metrics: common.FileMetric[];
  let apis: common.FileApi[];
  let vizs: common.FileVis[];
  let confs: common.FileProjectConf[];

  let file2s: common.File2[] = barYaml.removeWrongExt(
    {
      files: item.files,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  let file3s: common.File3[] = barYaml.deduplicateFileNames(
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
      file3s: file3s.filter(
        x =>
          [
            common.FileExtensionEnum.Api,
            common.FileExtensionEnum.Dashboard,
            common.FileExtensionEnum.Metric,
            common.FileExtensionEnum.Model,
            common.FileExtensionEnum.Rep,
            common.FileExtensionEnum.Udf,
            common.FileExtensionEnum.View,
            common.FileExtensionEnum.Vis,
            common.FileExtensionEnum.Yml
          ].indexOf(x.ext) > -1
      ),
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

  apis = splitFilesResult.apis;
  confs = splitFilesResult.confs;
  dashboards = splitFilesResult.dashboards;
  metrics = splitFilesResult.metrics;
  models = splitFilesResult.models;
  reps = splitFilesResult.reps;
  udfs = splitFilesResult.udfs;
  views = splitFilesResult.views;
  vizs = splitFilesResult.vizs;

  let projectConfig = barYaml.checkProjectConfig(
    {
      confs: confs,
      structId: item.structId,
      mproveDir: item.mproveDir,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return {
    apis: apis,
    dashboards: dashboards,
    projectConfig: projectConfig,
    metrics: metrics,
    models: models,
    reps: reps,
    udfs: udfs,
    views: views,
    vizs: vizs
  };
}
