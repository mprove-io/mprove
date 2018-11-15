import { enums } from '../barrels/enums';
import { types } from '../barrels/types';

export class ServerError extends Error {
  originalError: any;
  originalErrorMessage: any;
  originalErrorStackArray: any;
  stackArrayElementIndex2: any;
  stackArray: any;

  constructor(
    public data?: {
      name: types.errorsType;
      message?: string;
      originalError?: any;
    }
  ) {
    super();

    this.data = data ? data : { name: enums.otherErrorsEnum.INTERNAL };

    this.name = this.data.name.toString();

    this.message = this.data.message
      ? `${this.data.name}: ${this.data.message}`
      : `${this.data.name}`;

    this.originalError = this.data.originalError;

    this.originalErrorMessage = this.originalError
      ? this.originalError.message
      : undefined;

    this.originalErrorStackArray =
      this.originalError && this.originalError.stack
        ? this.originalError.stack.split('\n')
        : undefined;

    this.stackArray = this.stack ? this.stack.split('\n') : undefined;

    this.stackArrayElementIndex2 = this.stackArray
      ? this.stackArray[2]
      : undefined;
  }
}
