import axios from 'axios';
import { api } from '../../barrels/api';
import { config } from '../../barrels/config';
import { enums } from '../../barrels/enums';
import { ServerError } from '../server-error';

export const constantAxiosInstance = axios.create({
  baseURL: config.BLOCKML_BASE_PATH,
  timeout: config.BLOCKML_TIMEOUT,
});

constantAxiosInstance.interceptors.response.use(checkResponseStatus);

function checkResponseStatus(response: any) {
  if (response &&
    response.data &&
    response.data.info &&
    response.data.info.status === api.BlockmlResponseStatusEnum.Ok) {

    return response;

  } else if (response &&
    response.data &&
    response.data.info &&
    response.data.info.status === api.BlockmlResponseStatusEnum.BlockmlWrongRequestParams) {

    throw new ServerError({ name: enums.otherErrorsEnum.BLOCKML_RESPONSE_WRONG_REQUEST_PARAMS });

  } else if (response &&
    response.data &&
    response.data.info &&
    response.data.info.status === api.BlockmlResponseStatusEnum.BlockmlInternalError) {

    throw new ServerError({ name: enums.otherErrorsEnum.BLOCKML_RESPONSE_INTERNAL });

  } else {
    throw new ServerError({ name: enums.otherErrorsEnum.BLOCKML_RESPONSE_NOT_OK });
  }
}
