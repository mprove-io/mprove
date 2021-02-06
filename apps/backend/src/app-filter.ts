import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from './barrels/api-to-backend';
import { common } from './barrels/common';
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
        ? new common.ServerError({
            message: apiToBackend.ErEnum.BACKEND_UNAUTHORIZED,
            originalError: exception
          })
        : exception;

    response
      .status(HttpStatus.CREATED)
      .json(common.makeErrorResponse({ e: e, cs: this.cs, req: request }));
  }
}
