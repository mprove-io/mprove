import { AmError } from '../barrels/am-error';

export class ErrorsCollector {
  private static errors: AmError[];

  static clearErrors() {
    this.errors = [];
  }

  static addError(error: AmError) {
    this.errors.push(error);
  }

  static getErrors() {
    return this.errors;
  }
}
