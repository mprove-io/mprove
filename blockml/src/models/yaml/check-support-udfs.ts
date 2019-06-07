import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { api } from '../../barrels/api';

export function checkSupportUdfs(item: {
  filesAny: any[];
  connection: api.ProjectConnectionEnum;
}): any[] {
  if (item.connection === api.ProjectConnectionEnum.PostgreSQL) {
    item.filesAny.forEach(file => {
      Object.keys(file)
        .filter(x => !x.toString().match(ApRegex.ENDS_WITH_LINE_NUM()))
        .forEach(parameter => {
          if (
            ['.view', '.model'].indexOf(file.ext) > -1 &&
            parameter === 'udfs'
          ) {
            // error e296
            ErrorsCollector.addError(
              new AmError({
                title: `UDFs are not supported for ${
                  api.ProjectConnectionEnum.PostgreSQL
                }`,
                message: `parameter "${parameter}" is useless`,
                lines: [
                  {
                    line: file[parameter + '_line_num'],
                    name: file.name,
                    path: file.path
                  }
                ]
              })
            );

            delete file[parameter];
            delete file[parameter + '_line_num'];
            return;
          }

          if (['.udf'].indexOf(file.ext) > -1 && parameter === 'udf') {
            // error e297
            ErrorsCollector.addError(
              new AmError({
                title: `UDFs are not supported for ${
                  api.ProjectConnectionEnum.PostgreSQL
                }`,
                message: `.udf files are useless`,
                lines: [
                  {
                    line: file[parameter + '_line_num'],
                    name: file.name,
                    path: file.path
                  }
                ]
              })
            );

            delete file[parameter];
            delete file[parameter + '_line_num'];
            return;
          }
        });
    });
  }
  return item.filesAny;
}
