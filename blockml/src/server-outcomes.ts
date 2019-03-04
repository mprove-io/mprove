import { helper } from './barrels/helper';

export class ServerOutcomes {
  private static outcomes: { [key: string]: any } = {};

  static set(outcomeId: string, value: any) {
    this.outcomes[outcomeId] = value;
  }

  static async get(outcomeId: string) {
    while (!this.outcomes[outcomeId]) {
      await helper.delay(10);
    }

    return this.outcomes[outcomeId];
  }

  static delete(outcomeId: string) {
    delete this.outcomes[outcomeId];
  }
}
