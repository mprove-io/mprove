import path from 'node:path';
import { Command, Option } from 'clipanion';
import fse from 'fs-extra';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { SkillItem } from '#common/types/backend/parts/skill-item';
import type { ToBackendGetSkillsOutput } from '#common/types/backend/routes/skills/get-skills/get-skills-output';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq/mreq';

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

  async execute() {
    if (isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let getSkillsOutput: ToBackendGetSkillsOutput = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendGetSkills',
      payload: {},
      host: this.context.config.mproveCliHost
    });

    let outputDir = path.resolve(this.output);

    fse.ensureDirSync(outputDir);

    getSkillsOutput.skillItems.forEach((skill: SkillItem) => {
      let skillDir = path.join(outputDir, skill.name);
      fse.ensureDirSync(skillDir);

      let skillFilePath = path.join(skillDir, 'SKILL.md');
      fse.writeFileSync(skillFilePath, skill.content);
    });
  }
}
