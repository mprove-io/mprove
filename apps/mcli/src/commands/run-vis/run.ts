import { Command } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { mreq } from '~mcli/functions/mreq';

export class RunCommand extends Command {
  static paths = [[`run`]];

  static usage = Command.Usage({
    description: 'Run',
    examples: [['Run', 'mprove run']]
  });

  async execute() {
    let payload: apiToBackend.ToBackendGetVizRequestPayload = {
      projectId: 'DXYE72ODCP5LWPWH2EXQ',
      isRepoProd: true,
      branchId: 'main',
      envId: common.PROJECT_ENV_PROD,
      vizId: '10MLKFYJPPMXZM0DD4MB'
    };

    let resp = await mreq({
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetViz,
      payload: payload
    });

    this.context.stdout.write(`${JSON.stringify(resp, null, 2)}\n`);

    return 0;
  }
}
