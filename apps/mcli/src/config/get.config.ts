import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { transformValidSyncMcli } from '~mcli/functions/transform-valid-sync-mcli';

export function getConfig(envPath?: string) {
  let envFilePath = common.isDefined(envPath)
    ? envPath
    : common.isDefined(process.env.ENV_FILE_PATH)
    ? process.env.ENV_FILE_PATH
    : '.env';

  let envFile: any = {};

  if (common.isDefined(envFilePath)) {
    let isPathExist = fse.pathExistsSync(envFilePath);
    if (isPathExist === true) {
      let stat = fse.statSync(envFilePath);
      if (stat.isFile() === true) {
        envFile = parse(fse.readFileSync(envFilePath));
      }
    }
  }

  let config: interfaces.Config = {
    mproveCliHost: process.env.MPROVE_CLI_HOST || envFile.MPROVE_CLI_HOST,

    mproveCliEmail: process.env.MPROVE_CLI_EMAIL || envFile.MPROVE_CLI_EMAIL,

    mproveCliPassword:
      process.env.MPROVE_CLI_PASSWORD || envFile.MPROVE_CLI_PASSWORD,

    mproveCliProjectId:
      process.env.MPROVE_CLI_PROJECT_ID || envFile.MPROVE_CLI_PROJECT_ID,

    mproveCliTestReposPath:
      process.env.MPROVE_CLI_TEST_REPOS_PATH ||
      envFile.MPROVE_CLI_TEST_REPOS_PATH,

    mproveCliTestLocalSourceGitUrl:
      process.env.MPROVE_CLI_TEST_LOCAL_SOURCE_GIT_URL ||
      envFile.MPROVE_CLI_TEST_LOCAL_SOURCE_GIT_URL,

    mproveCliTestDevSourceGitUrl:
      process.env.MPROVE_CLI_TEST_DEV_SOURCE_GIT_URL ||
      envFile.MPROVE_CLI_TEST_DEV_SOURCE_GIT_URL,

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
