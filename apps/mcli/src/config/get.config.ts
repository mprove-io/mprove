import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { nodeCommon } from '~mcli/barrels/node-common';

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

    mproveCliLogIsJson: <common.BoolEnum>(
      (process.env.MPROVE_CLI_LOG_IS_JSON || envFile.MPROVE_CLI_LOG_IS_JSON)
    ),

    mproveCliProjectId:
      process.env.MPROVE_CLI_PROJECT_ID || envFile.MPROVE_CLI_PROJECT_ID,

    mproveCliIsRepoProd: <common.BoolEnum>(
      (process.env.MPROVE_CLI_IS_REPO_PROD || envFile.MPROVE_CLI_IS_REPO_PROD)
    ),

    mproveCliBranchId:
      process.env.MPROVE_CLI_BRANCH_ID || envFile.MPROVE_CLI_BRANCH_ID,

    mproveCliEnvId: process.env.MPROVE_CLI_ENV_ID || envFile.MPROVE_CLI_ENV_ID
  };

  let validatedConfig = nodeCommon.transformValidSync({
    classType: interfaces.Config,
    object: config,
    errorMessage: common.ErEnum.MCLI_WRONG_ENV_VALUES,
    logIsJson: config.mproveCliLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
