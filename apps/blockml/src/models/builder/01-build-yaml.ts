import { ConfigService } from '@nestjs/config';
import { barYaml } from '~blockml/barrels/bar-yaml';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

export function buildYaml(
  item: {
    errors: BmError[];
    files: common.BmlFile[];
    structId: string;
    connections: common.ProjectConnection[];
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let udfs: interfaces.Udf[];
  let views: interfaces.View[];
  let models: interfaces.Model[];
  let dashboards: interfaces.Dashboard[];
  let vizs: interfaces.Viz[];
  let confs: interfaces.Conf[];

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
      file3s: file3s.filter(
        x =>
          [
            common.FileExtensionEnum.Conf,
            common.FileExtensionEnum.Udf,
            common.FileExtensionEnum.View,
            common.FileExtensionEnum.Model,
            common.FileExtensionEnum.Viz,
            common.FileExtensionEnum.Dashboard
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

  udfs = splitFilesResult.udfs;
  views = splitFilesResult.views;
  models = splitFilesResult.models;
  dashboards = splitFilesResult.dashboards;
  vizs = splitFilesResult.vizs;
  confs = splitFilesResult.confs;

  let projectConf = barYaml.checkProjectConfig(
    {
      confs: confs,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return {
    udfs: udfs,
    views: views,
    models: models,
    dashboards: dashboards,
    vizs: vizs,
    projectConf: projectConf
  };
}
