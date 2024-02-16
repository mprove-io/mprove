import { Injectable } from '@nestjs/common';
const ivm = require('isolated-vm');

@Injectable()
export class UserCodeService {
  constructor() {}

  async run(item: { data: any; userCode: string }): Promise<any> {
    let { data, userCode } = item;

    let isolate = new ivm.Isolate({ memoryLimit: 8 });
    let context = await isolate.createContext();

    let code = `JSON.stringify((function() {
let data = ${JSON.stringify(data)};
${userCode};
})())`;

    try {
      let script = await isolate.compileScript(code);
      let result = await script.run(context);
      return result;
    } catch (error: any) {
      throw new Error(`Error executing user code: ${error.message}`);
    } finally {
      // Dispose the isolate to free up memory
      isolate.dispose();
    }
  }
}
