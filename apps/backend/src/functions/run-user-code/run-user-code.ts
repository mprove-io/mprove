import ivm from 'isolated-vm';

export async function runUserCode(item: { userCode: string }): Promise<any> {
  let { userCode } = item;

  let isolate: ivm.Isolate = new ivm.Isolate({ memoryLimit: 8 });

  let context: ivm.Context = await isolate.createContext();

  try {
    let timeoutMs = 500;

    let script: ivm.Script = await isolate.compileScript(userCode);

    let result: any = await script.run(context, { timeout: timeoutMs });

    return { outValue: result };
  } catch (error: any) {
    return { outError: `${error.message}\n${error.stack}` };
  } finally {
    if (isolate.isDisposed === false) {
      isolate.dispose();
    }
  }
}
