import { IsEnum, IsOptional } from 'class-validator';
import * as apiEnums from '~api/enums/_index';

export class ServerError extends Error {
  @IsEnum(apiEnums.ErEnum)
  message: apiEnums.ErEnum;

  @IsOptional()
  data?: any;

  @IsOptional()
  originalError?: any;

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
