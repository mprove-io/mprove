import path from 'node:path';
import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import fse from 'fs-extra';
import type { SkillItem } from '#common/types/backend/parts/skill-item';
import type { ToBackendGetSkillsOutput } from '#common/types/backend/routes/skills/get-skills/get-skills-output';
import type { ToBackendGetSkillsResponse } from '#common/types/backend/routes/skills/get-skills/get-skills-response';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { mreqResult } from '#mcli/functions/mreq-result/mreq-result';
import type { GetSkillsCommandError } from '#mcli/types/function-errors/get-skills-command-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export class GetSkillsCommand extends CustomCommand {
  static paths = [['get-skills']];

  static usage = Command.Usage({
    description: 'Download Mprove skills to a local directory',
    examples: [
      ['Download skills to a directory', 'mprove get-skills --output ./skills']
    ]
  });

  output = Option.String('--output', {
    required: true,
    description: '(required) Output directory path'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  override async act(): Result.ResultAsync<void, GetSkillsCommandError> {
    let apiKey = this.context.config.mproveCliApiKey;

    let getSkillsOutputResult: Result.Result<
      ToBackendGetSkillsOutput,
      MreqError<ToBackendGetSkillsResponse>
    > = await mreqResult({
      apiKey: apiKey,
      route: 'api/ToBackendGetSkills',
      payload: {},
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(getSkillsOutputResult)) {
      return getSkillsOutputResult;
    }

    let getSkillsOutput: ToBackendGetSkillsOutput = getSkillsOutputResult.value;

    let outputDir = path.resolve(this.output);

    fse.ensureDirSync(outputDir);

    getSkillsOutput.skillItems.forEach((skill: SkillItem) => {
      let skillDir = path.join(outputDir, skill.name);
      fse.ensureDirSync(skillDir);

      let skillFilePath = path.join(skillDir, 'SKILL.md');
      fse.writeFileSync(skillFilePath, skill.content);
    });

    return Result.succeed();
  }
}
