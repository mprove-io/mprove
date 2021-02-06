import { IsOptional } from 'class-validator';

export class ServerError extends Error {
  message: any;

  @IsOptional()
  data?: any;

  @IsOptional()
  originalError?: any;

  constructor(item: { message: any; data?: any; originalError?: any }) {
    super();

    this.message = item.message;
    this.data = item.data;
    this.originalError = item.originalError;
  }
}
