import * as apiEnums from '../enums/_index';

export class ServerError extends Error {
  originalError: any;
  data: any;

  constructor(item: {
    message: apiEnums.ErEnum;
    data?: any;
    originalError?: any;
  }) {
    super();

    this.message = item.message;
    this.data = item.data;
    this.originalError = item.originalError;
  }
}
