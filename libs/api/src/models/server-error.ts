import { IsEnum, IsOptional } from 'class-validator';
import { enums } from '~api/barrels/enums';

export class ServerError extends Error {
  @IsEnum(enums.ErEnum)
  message: enums.ErEnum;

  @IsOptional()
  data?: any;

  @IsOptional()
  originalError?: any;

  constructor(item: {
    message: enums.ErEnum;
    data?: any;
    originalError?: any;
  }) {
    super();

    this.message = item.message;
    this.data = item.data;
    this.originalError = item.originalError;
  }
}
