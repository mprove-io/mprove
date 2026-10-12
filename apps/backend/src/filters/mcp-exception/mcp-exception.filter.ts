import {
  type ArgumentsHost,
  Catch,
  type RpcExceptionFilter
} from '@nestjs/common';
import { type Observable, throwError } from 'rxjs';
import { McpToolResponseException } from '#backend/filters/mcp-exception/mcp-tool-response-exception';
import { ServerError } from '#common/classes/server-error/server-error';

@Catch()
export class McpExceptionFilter implements RpcExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    if (exception instanceof McpToolResponseException) {
      let result: Observable<never> = throwError(() => exception.getError());

      return result;
    }

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
