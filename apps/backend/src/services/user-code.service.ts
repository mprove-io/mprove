import { Injectable } from '@nestjs/common';
import ivm from 'isolated-vm';

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
      return { outError: `${error.message}\n${error.stack}` };
    } finally {
      if (isolate.isDisposed === false) {
        isolate.dispose();
      }
    }
  }
}
