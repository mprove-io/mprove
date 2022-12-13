import { BaseContext, Cli, CommandClass } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { CustomContext } from '~mcli/models/custom-command';
import { mreq } from './mreq';

export async function prepareTest(item: {
  command: CommandClass<CustomContext | BaseContext>;
  config: interfaces.Config;
  deletePack?: apiToBackend.ToBackendDeleteRecordsRequestPayload;
  seedPack?: apiToBackend.ToBackendSeedRecordsRequestPayload;
  loginEmail?: string;
  loginPassword?: string;
}) {
  let { command, config, deletePack, seedPack, loginEmail, loginPassword } =
    item;

  let cli = new Cli({
    enableCapture: false,
    enableColors: true,
    binaryLabel: 'Mprove',
    binaryName: 'mprove',
    binaryVersion: require('../../../../package.json').version
  });

  if (common.isDefined(command)) {
    cli.register(command);
  }

  if (common.isDefined(deletePack)) {
    await mreq<apiToBackend.ToBackendDeleteRecordsResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
      payload: deletePack,
      host: config.mproveCliHost
    });
  }

  if (common.isDefined(seedPack)) {
    await mreq<apiToBackend.ToBackendSeedRecordsResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
      payload: seedPack,
      host: config.mproveCliHost
    });
  }

  let loginUserResp: apiToBackend.ToBackendLoginUserResponse;
  if (common.isDefined(loginEmail) && common.isDefined(loginPassword)) {
    let loginUserReqPayload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: loginEmail,
      password: loginPassword
    };

    loginUserResp = await mreq<apiToBackend.ToBackendLoginUserResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      payload: loginUserReqPayload,
      host: config.mproveCliHost
    });
  }

  let createMockContext = (itemC: {
    loginToken: string;
    config: interfaces.Config;
  }) => {
    let out = '';
    let err = '';

    return {
      stderr: {
        toString: () => err,
        write: (input: string) => {
          err += input;
        }
      },
      stdout: {
        toString: () => out,
        write: (input: string) => {
          out += input;
        }
      },
      loginToken: itemC.loginToken,
      config: itemC.config
    };
  };

  let mockContext = createMockContext({
    loginToken: loginUserResp?.payload?.token,
    config: config
  });

  return {
    mockContext: mockContext,
    cli: cli
  };
}
