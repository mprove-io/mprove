import {
  type ArgumentsHost,
  Catch,
  type RpcExceptionFilter
} from '@nestjs/common';
import { type Observable, throwError } from 'rxjs';
import { ServerError } from '#common/classes/server-error/server-error';

@Catch()
export class McpExceptionFilter implements RpcExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    let message: string = JSON.stringify({
      error:
        exception instanceof ServerError ? exception.message : 'INTERNAL_ERROR'
    });

    let result: Observable<never> = throwError(() => ({
      status: 'error',
      message: message
    }));

    return result;
  }
}
