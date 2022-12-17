import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { transformValidSyncMcli } from '~mcli/functions/transform-valid-sync-mcli';

export function getConfig() {
  let envFilePath = process.env.ENV_FILE_PATH;

  let envFile: any = {};

  if (common.isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let config: interfaces.Config = {
    mproveCliHost: process.env.MPROVE_CLI_HOST || envFile.MPROVE_CLI_HOST,

    mproveCliEmail: process.env.MPROVE_CLI_EMAIL || envFile.MPROVE_CLI_EMAIL,

    mproveCliPassword:
      process.env.MPROVE_CLI_PASSWORD || envFile.MPROVE_CLI_PASSWORD,

    mproveCliReposPath:
      process.env.MPROVE_CLI_REPOS_PATH || envFile.MPROVE_CLI_REPOS_PATH,

    mproveCliTestGitUrl:
      process.env.MPROVE_CLI_TEST_GIT_URL || envFile.MPROVE_CLI_TEST_GIT_URL,

    mproveCliTestPrivateKeyPath:
      process.env.MPROVE_CLI_TEST_PRIVATE_KEY_PATH ||
      envFile.MPROVE_CLI_TEST_PRIVATE_KEY_PATH,

    mproveCliTestPublicKeyPath:
      process.env.MPROVE_CLI_TEST_PUBLIC_KEY_PATH ||
      envFile.MPROVE_CLI_TEST_PUBLIC_KEY_PATH,

    mproveCliTestDwhPostgresPassword:
      process.env.MPROVE_CLI_TEST_DWH_POSTGRES_PASSWORD ||
      envFile.MPROVE_CLI_TEST_DWH_POSTGRES_PASSWORD
  };

  let validatedConfig = transformValidSyncMcli({
    classType: interfaces.Config,
    object: config,
    errorMessage: common.ErEnum.MCLI_WRONG_ENV_VALUES
  });

  return validatedConfig;
}
