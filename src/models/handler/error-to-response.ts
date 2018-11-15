import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { ServerError } from '../server-error';

export async function errorToResponse(err: any, req: any, res: any, next: any) {
  if (err) {
    console.log(err); // TODO: sentry

    res.json({
      info: {
        origin: api.CommunicationOriginEnum.SERVER,
        type: api.CommunicationTypeEnum.RESPONSE,
        reply_to: req.body.info.request_id,
        status:
          err.name === enums.middlewareErrorsEnum.MIDDLEWARE_CHECK_JWT &&
          err.originalError.name === 'UnauthorizedError'
            ? api.ServerResponseStatusEnum.AuthorizationError
            : err instanceof ServerError
            ? mapErrors(err.name)
            : api.ServerResponseStatusEnum.InternalServerError,
        error: {
          message: undefined
        }
      },
      payload: undefined
    });
  } else {
    next();
  }
}

function mapErrors(name: string) {
  switch (name) {
    case enums.otherErrorsEnum.INTERNAL:
      return api.ServerResponseStatusEnum.InternalServerError;
    case enums.otherErrorsEnum.API:
      return api.ServerResponseStatusEnum.ApiError;
    case enums.otherErrorsEnum.AUTHORIZATION_EMAIL:
      return api.ServerResponseStatusEnum.AuthorizationEmailError;

    default:
      return api.ServerResponseStatusEnum.InternalServerError;
  }
}
