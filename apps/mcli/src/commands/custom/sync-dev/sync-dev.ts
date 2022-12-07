import { Command, Option } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { CustomCommand } from '~mcli/models/custom-command';

export class SyncDevRepoCommand extends CustomCommand {
  static paths = [['sync', 'dev']];

  static usage = Command.Usage({
    description: 'Synchronize files between local and dev repository',
    examples: [
      [
        'Synchronize files between local and dev repository',
        'sync dev -p DXYE72ODCP5LWPWH2EXQ'
      ]
    ]
  });

  projectId = Option.String('-p,--projectId', {
    required: true,
    description: '(required) Project Id'
  });

  json = Option.Boolean('-j,--json', false, {
    description: '(default false)'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }
  }
}
