import { Result } from '@praha/byethrow';
import { parse } from 'dotenv';
import fse from 'fs-extra';
import type { ZodSafeParseResult } from 'zod';

import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetConfigError } from '#mcli/types/function-errors/get-config-error';
import { type McliConfig, zMcliConfig } from './mcli-config';

export function getConfigResult(item: {
  envPath?: string;
}): Result.Result<McliConfig, GetConfigError> {
  let { envPath } = item;

  let envFilePath = isDefined(envPath) ? envPath : '.env';

  let envFile: any = {};

  if (isDefined(envFilePath)) {
    let isPathExist = fse.pathExistsSync(envFilePath);
    if (isPathExist === true) {
      let stat = fse.statSync(envFilePath);
      if (stat.isFile() === true) {
        envFile = parse(fse.readFileSync(envFilePath));
      }
    }
  }

  let config: McliConfig = {
    mproveCliHost: process.env.MPROVE_CLI_HOST || envFile.MPROVE_CLI_HOST,

    mproveCliApiKey:
      process.env.MPROVE_CLI_API_KEY || envFile.MPROVE_CLI_API_KEY,

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

    mproveCliTestPublicKeyPath:
      process.env.MPROVE_CLI_TEST_PUBLIC_KEY_PATH ||
      envFile.MPROVE_CLI_TEST_PUBLIC_KEY_PATH,

    mproveCliTestPrivateKeyEncryptedPath:
      process.env.MPROVE_CLI_TEST_PRIVATE_KEY_ENCRYPTED_PATH ||
      envFile.MPROVE_CLI_TEST_PRIVATE_KEY_ENCRYPTED_PATH,

    mproveCliTestPassPhrase:
      process.env.MPROVE_CLI_TEST_PASS_PHRASE ||
      envFile.MPROVE_CLI_TEST_PASS_PHRASE,

    mproveCliTestDwhPostgresUser:
      process.env.MPROVE_CLI_TEST_DWH_POSTGRES_USER ||
      envFile.MPROVE_CLI_TEST_DWH_POSTGRES_USER,

    mproveCliTestDwhPostgresPassword:
      process.env.MPROVE_CLI_TEST_DWH_POSTGRES_PASSWORD ||
      envFile.MPROVE_CLI_TEST_DWH_POSTGRES_PASSWORD
  };

  let validation: ZodSafeParseResult<McliConfig> =
    zMcliConfig.safeParse(config);

  if (validation.success === false) {
    return Result.fail({
      code: 'MCLI_WRONG_ENV_VALUES',
      displayData: validation.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  return Result.succeed(validation.data);
}
