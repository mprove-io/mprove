export class ErrorData {
  message?: any;
  description?: string;
  leftButtonText?: string;
  rightButtonText?: string;
  leftOnClickFnBindThis?: () => any;
  rightOnClickFnBindThis?: () => any;
  originalError?: any;
  reqUrl?: string;
  reqHeaders?: any;
  reqBody?: any;
  response?: any;
  skipLogToConsole?: boolean;
}
