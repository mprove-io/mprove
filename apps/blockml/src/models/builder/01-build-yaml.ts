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
  let views: common.FileView[];
  let models: common.FileModel[];
  let mods: common.FileMod[];
  let stores: common.FileStore[];
  let reports: common.FileReport[];
  let dashboards: common.FileDashboard[];
  let charts: common.FileChart[];
  let confs: common.FileProjectConf[];
  let udfs: common.FileUdf[];

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
            common.FileExtensionEnum.View,
            common.FileExtensionEnum.Model,
            common.FileExtensionEnum.Mod,
            common.FileExtensionEnum.Store,
            common.FileExtensionEnum.Report,
            common.FileExtensionEnum.Dashboard,
            common.FileExtensionEnum.Chart,
            common.FileExtensionEnum.Udf,
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

  models = splitFilesResult.models;
  mods = splitFilesResult.mods;
  stores = splitFilesResult.stores;
  confs = splitFilesResult.confs;
  dashboards = splitFilesResult.dashboards;
  reports = splitFilesResult.reports;
  udfs = splitFilesResult.udfs;
  views = splitFilesResult.views;
  charts = splitFilesResult.charts;

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
    views: views,
    models: models,
    mods: mods,
    stores: stores,
    reports: reports,
    dashboards: dashboards,
    charts: charts,
    projectConfig: projectConfig,
    udfs: udfs
  };
}
