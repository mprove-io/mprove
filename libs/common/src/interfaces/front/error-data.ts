export class ErrorData {
  message?: any;
  description?: string;
  buttonText?: string;
  onClickFnBindThis?: () => any;
  originalError?: any;
  reqUrl?: string;
  reqHeaders?: any;
  reqBody?: any;
  response?: any;
  skipLogToConsole?: boolean;
}
