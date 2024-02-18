import { Injectable } from '@nestjs/common';
const ivm = require('isolated-vm');

@Injectable()
export class UserCodeService {
  constructor() {}

  async runOnly(item: { userCode: string }): Promise<any> {
    let { userCode } = item;

    let isolate = new ivm.Isolate({ memoryLimit: 8 });
    let context = await isolate.createContext();

    try {
      let timeoutMs = 500;
      let script = await isolate.compileScript(userCode);
      let result = await script.run(context, { timeout: timeoutMs });
      return { outValue: result };
    } catch (error: any) {
      // console.log('error:');
      // console.log(error);
      // console.log('error.message:');
      // console.log(error.message);
      return { outError: error.message };
    } finally {
      isolate.dispose();
    }
  }

  //   async run(item: { data: any; userCode: string }): Promise<any> {
  //     let { data, userCode } = item;

  //     let isolate = new ivm.Isolate({ memoryLimit: 8 });
  //     let context = await isolate.createContext();

  //     let code = `JSON.stringify((function() {
  // let data = ${JSON.stringify(data)};
  // ${userCode};
  // })())`;

  //     try {
  //       let script = await isolate.compileScript(code);
  //       let result = await script.run(context);
  //       return result;
  //     } catch (error: any) {
  //       throw new Error(`Error executing user code: ${error.message}`);
  //     } finally {
  //       // Dispose the isolate to free up memory
  //       isolate.dispose();
  //     }
  //   }
}
