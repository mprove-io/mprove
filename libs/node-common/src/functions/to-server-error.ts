import { ServerError } from '#common/models/server-error';

export function toServerError(item: { message: string }): ServerError {
  return new ServerError({
    message: item.message
  });
}
