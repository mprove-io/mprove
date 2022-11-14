import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions
} from 'nest-winston';
import { format, transports } from 'winston';

export const PASSWORD_EXPIRES_OFFSET = 86400000;

export const SKIP_JWT = 'skipJwt';

export const DEFAULT_QUERY_SIZE_LIMIT = 1;

export const UNK_USER_ID = 'unk';

export const WINSTON_PRETTY_OPTIONS: WinstonModuleOptions = {
  transports: new transports.Console({
    format: format.combine(
      format.timestamp(),
      // format.ms(),
      nestWinstonModuleUtilities.format.nestLike('Backend', {
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
