import { z } from 'zod';
import { ServerError } from '#common/models/server-error';

export function zodParseOrThrowMcli<T extends z.ZodType>(item: {
  schema: T;
  object: unknown;
  errorMessage: any;
}): z.infer<T> {
  let { schema, object, errorMessage } = item;

  let result = schema.safeParse(object);

  if (result.success) {
    return result.data;
  }

  let constraints = result.error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));

  throw new ServerError({
    message: errorMessage,
    displayData: constraints
  });
}
