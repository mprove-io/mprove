import path from 'node:path';
import { Command, Option } from 'clipanion';
import fse from 'fs-extra';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type {
  SkillItem,
  ToBackendDownloadSkillsResponse
} from '#common/interfaces/to-backend/skills/to-backend-download-skills';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

export class DownloadSkillsCommand extends CustomCommand {
  static paths = [['download-skills']];

  static usage = Command.Usage({
    description: 'Download mprove skills to a local directory',
    examples: [
      [
        'Download skills to a directory',
        'mprove download-skills --output ./skills'
      ]
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

    let downloadSkillsResp = await mreq<ToBackendDownloadSkillsResponse>({
      apiKey: apiKey,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDownloadSkills,
      payload: {},
      host: this.context.config.mproveCliHost
    });

    let outputDir = path.resolve(this.output);

    fse.ensureDirSync(outputDir);

    downloadSkillsResp.payload.skillItems.forEach((skill: SkillItem) => {
      let skillDir = path.join(outputDir, skill.name);
      fse.ensureDirSync(skillDir);

      let skillFilePath = path.join(skillDir, 'SKILL.md');
      fse.writeFileSync(skillFilePath, skill.content);
    });
  }
}
