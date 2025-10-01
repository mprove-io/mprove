import { IsOptional } from 'class-validator';

export class ServerError extends Error {
  message: any;

  @IsOptional()
  displayData?: any;

  @IsOptional()
  customData?: any;

  @IsOptional()
  originalError?: any;

  constructor(item: {
    message: any;
    displayData?: any;
    customData?: any;
    originalError?: any;
  }) {
    super();

    this.message = item.message;
    this.displayData = item.displayData;
    this.customData = item.customData;
    this.originalError = item.originalError;
  }
}
