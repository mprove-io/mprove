import * as apiEnums from '../../enums/_index';

export class ToDiskResponseInfo {
  status: apiEnums.ToDiskResponseInfoStatusEnum;
  traceId: string;
  error?: any;
}
