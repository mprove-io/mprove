export class ServerProErrors {
  private static proErrors: { [key: string]: any } = {};

  static set(outcomeId: string, value: any) {
    this.proErrors[outcomeId] = value;
  }

  static delete(outcomeId: string) {
    delete this.proErrors[outcomeId];
  }

  static get(outcomeId: string) {
    return this.proErrors[outcomeId];
  }
}
