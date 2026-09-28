import { createRequire } from 'node:module';
import { BaseContext, Cli, CommandClass } from 'clipanion';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendDeleteRecordsRequest } from '#common/zod/backend/routes/test-routes/delete-records/delete-records-request';
import type { ToBackendSeedRecordsRequest } from '#common/zod/backend/routes/test-routes/seed-records/seed-records-request';
import type { CustomContext } from '#mcli/classes/custom-command/custom-command';
import { McliConfig } from '#mcli/config/mcli-config';
import { mreq } from '#mcli/functions/mreq/mreq';

const require = createRequire(import.meta.url);

export async function prepareTest(item: {
  command: CommandClass<CustomContext | BaseContext>;
  config: McliConfig;
  deletePack?: ToBackendDeleteRecordsRequest['input'];
  seedPack?: ToBackendSeedRecordsRequest['input'];
  apiKey?: string;
}) {
  let { command, config, deletePack, seedPack, apiKey } = item;

  let cli = new Cli({
    enableCapture: false,
    enableColors: true,
    binaryLabel: 'Mprove',
    binaryName: 'mprove',
    binaryVersion: require('../../../../package.json').version
  });

  if (isDefined(command)) {
    cli.register(command);
  }

  if (isDefined(deletePack)) {
    await mreq({
      route: 'api/ToBackendDeleteRecords',
      payload: deletePack,
      host: config.mproveCliHost
    });
  }

  if (isDefined(seedPack)) {
    await mreq({
      route: 'api/ToBackendSeedRecords',
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
