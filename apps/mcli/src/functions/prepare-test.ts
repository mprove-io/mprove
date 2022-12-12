import { BaseContext, Cli, CommandClass } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { CustomContext } from '~mcli/models/custom-command';
import { mreq } from './mreq';

export async function prepareTest(item: {
  command: CommandClass<CustomContext | BaseContext>;
  isPrepConfig: boolean;
  deletePack?: apiToBackend.ToBackendDeleteRecordsRequestPayload;
  seedPack?: apiToBackend.ToBackendSeedRecordsRequestPayload;
  loginEmail?: string;
  loginPassword?: string;
}) {
  let prepConfig;

  let {
    command,
    isPrepConfig,
    deletePack,
    seedPack,
    loginEmail,
    loginPassword
  } = item;

  if (isPrepConfig === true) {
    prepConfig = getConfig();
  }

  let createMockContext = () => {
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
      }
    };
  };

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

  let mockContext = createMockContext();

  if (common.isDefined(deletePack)) {
    await mreq<apiToBackend.ToBackendDeleteRecordsResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
      payload: deletePack,
      host: prepConfig.mproveCliHost
    });
  }

  if (common.isDefined(seedPack)) {
    await mreq<apiToBackend.ToBackendSeedRecordsResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
      payload: seedPack,
      host: prepConfig.mproveCliHost
    });
  }

  let loginUserResp;
  if (common.isDefined(loginEmail) && common.isDefined(loginPassword)) {
    let loginUserReqPayload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: loginEmail,
      password: loginPassword
    };

    loginUserResp = await mreq<apiToBackend.ToBackendLoginUserResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      payload: loginUserReqPayload,
      host: prepConfig.mproveCliHost
    });
  }

  return {
    prepConfig: prepConfig,
    mockContext: mockContext,
    cli: cli,
    token: loginUserResp?.payload?.token
  };
}
