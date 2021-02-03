import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from './barrels/api';
import { interfaces } from './barrels/interfaces';

@Catch()
export class AppFilter implements ExceptionFilter {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // const status =
    //   exception instanceof HttpException
    //     ? exception.getStatus()
    //     : HttpStatus.INTERNAL_SERVER_ERROR;

    let e =
      (exception as any).message === 'Unauthorized'
        ? new api.ServerError({
            message: api.ErEnum.BACKEND_UNAUTHORIZED,
            originalError: exception
          })
        : exception;

    response
      .status(HttpStatus.CREATED)
      .json(api.makeErrorResponse({ e: e, cs: this.cs, req: request }));
  }
}
