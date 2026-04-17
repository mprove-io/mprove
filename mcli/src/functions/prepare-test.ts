import { createRequire } from 'node:module';
import { BaseContext, Cli, CommandClass } from 'clipanion';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type {
  ToBackendDeleteRecordsRequestPayload,
  ToBackendDeleteRecordsResponse
} from '#common/zod/to-backend/test-routes/to-backend-delete-records';
import type {
  ToBackendSeedRecordsRequestPayload,
  ToBackendSeedRecordsResponse
} from '#common/zod/to-backend/test-routes/to-backend-seed-records';
import { McliConfig } from '#mcli/config/mcli-config';
import { CustomContext } from '#mcli/models/custom-command';
import { mreq } from './mreq';

const require = createRequire(import.meta.url);

export async function prepareTest(item: {
  command: CommandClass<CustomContext | BaseContext>;
  config: McliConfig;
  deletePack?: ToBackendDeleteRecordsRequestPayload;
  seedPack?: ToBackendSeedRecordsRequestPayload;
  apiKey?: string;
}) {
  let { command, config, deletePack, seedPack, apiKey } = item;

  let cli = new Cli({
    enableCapture: false,
    enableColors: true,
    binaryLabel: 'Mprove',
    binaryName: 'mprove',
    binaryVersion: require('../../package.json').version
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

  let createMockContext = (itemC: { config: McliConfig; apiKey: string }) => {
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
      config: { ...itemC.config, mproveCliApiKey: itemC.apiKey }
    };
  };

  let mockContext = createMockContext({
    config: config,
    apiKey: apiKey
  });

  return {
    mockContext: mockContext,
    cli: cli
  };
}
