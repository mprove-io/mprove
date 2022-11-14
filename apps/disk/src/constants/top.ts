import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions
} from 'nest-winston';
import { format, transports } from 'winston';

export const WINSTON_PRETTY_OPTIONS: WinstonModuleOptions = {
  transports: new transports.Console({
    format: format.combine(
      format.timestamp(),
      // format.ms(),
      nestWinstonModuleUtilities.format.nestLike('Disk', {
        prettyPrint: true,
        colors: true
      })
    )
  })
};

export const WINSTON_JSON_OPTIONS: WinstonModuleOptions = {
  transports: new transports.Console({
    format: format.combine(
      format.timestamp(),
      // format.ms(),
      format.json()
    )
  })
};

export const CENTRAL_REPO_ID = 'central';

export const TEST_PROJECTS = 'dist/apps/disk/assets/test-projects';
