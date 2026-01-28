import { BaseContext, Cli, CommandClass } from 'clipanion';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendDeleteRecordsRequestPayload,
  ToBackendDeleteRecordsResponse
} from '#common/interfaces/to-backend/test-routes/to-backend-delete-records';
import {
  ToBackendSeedRecordsRequestPayload,
  ToBackendSeedRecordsResponse
} from '#common/interfaces/to-backend/test-routes/to-backend-seed-records';
import {
  ToBackendLoginUserRequestPayload,
  ToBackendLoginUserResponse
} from '#common/interfaces/to-backend/users/to-backend-login-user';
import { McliConfig } from '~mcli/config/mcli-config';
import { CustomContext } from '~mcli/models/custom-command';
import { mreq } from './mreq';

export async function prepareTest(item: {
  command: CommandClass<CustomContext | BaseContext>;
  config: McliConfig;
  deletePack?: ToBackendDeleteRecordsRequestPayload;
  seedPack?: ToBackendSeedRecordsRequestPayload;
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
    binaryVersion: require('../../../../../../package.json').version
  });

  if (isDefined(command)) {
    cli.register(command);
  }

  if (isDefined(deletePack)) {
    await mreq<ToBackendDeleteRecordsResponse>({
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
      payload: deletePack,
      host: config.mproveCliHost
    });
  }

  if (isDefined(seedPack)) {
    await mreq<ToBackendSeedRecordsResponse>({
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
      payload: seedPack,
      host: config.mproveCliHost
    });
  }

  let loginUserResp: ToBackendLoginUserResponse;
  if (isDefined(loginEmail) && isDefined(loginPassword)) {
    let loginUserReqPayload: ToBackendLoginUserRequestPayload = {
      email: loginEmail,
      password: loginPassword
    };

    loginUserResp = await mreq<ToBackendLoginUserResponse>({
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      payload: loginUserReqPayload,
      host: config.mproveCliHost
    });
  }

  let createMockContext = (itemC: {
    loginToken: string;
    config: McliConfig;
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
