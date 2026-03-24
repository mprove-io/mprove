import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ServerError } from '#common/models/server-error';

@Catch()
export class McpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost): string {
    if (exception instanceof ServerError) {
      return JSON.stringify({ error: exception.message });
    }

    return JSON.stringify({ error: 'INTERNAL_ERROR' });
  }
}
