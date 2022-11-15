import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions
} from 'nest-winston';
import { format, transports } from 'winston';

export function getLoggerOptions(item: { appName: any; isJson: boolean }) {
  let { appName, isJson } = item;

  let options: WinstonModuleOptions;

  if (isJson === true) {
    options = {
      transports: new transports.Console({
        format: format.combine(
          format.timestamp(),
          // format.ms(),
          format.json()
        )
      })
    };
  } else {
    options = {
      transports: new transports.Console({
        format: format.combine(
          format.timestamp(),
          // format.ms(),
          nestWinstonModuleUtilities.format.nestLike(appName, {
            prettyPrint: true,
            colors: true
          })
        )
      })
    };
  }

  return options;
}
