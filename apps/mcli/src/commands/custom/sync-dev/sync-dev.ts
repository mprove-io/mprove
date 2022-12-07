import { Command, Option } from 'clipanion';
import * as nodegit from 'nodegit';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { CustomCommand } from '~mcli/models/custom-command';

export class SyncDevRepoCommand extends CustomCommand {
  static paths = [['sync', 'dev']];

  static usage = Command.Usage({
    description: 'Synchronize files between Local and personal Dev repository',
    examples: [
      [
        'Synchronize files between Local and personal Dev repository',
        'sync dev --projectId DXYE72ODCP5LWPWH2EXQ'
      ]
    ]
  });

  dir = Option.String('-d,--dir', {
    description: '(optional) Absolute path of local git repository'
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

    // check is git repo
    let repoDir = common.isDefined(this.dir) ? this.dir : process.cwd();

    let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

    // get current branch
    let currentBranchRef = await gitRepo.getCurrentBranch();
    let currentBranchName = await nodegit.Branch.name(currentBranchRef);

    // get last commit
    let head: nodegit.Commit = await gitRepo.getHeadCommit();
    let headOid = head.id();
    let headOidStr = headOid.tostrS();

    // find git changed files
    let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

    logToConsoleMcli({
      log: statusFiles.map(x => x.path()),
      // log: statusFiles.map(x => x.status()),
      // log: statusFiles,
      // log: headOidStr,
      // log: currentBranchName,
      // log: repoDir,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: false
    });

    // read git changed files
    // send git changed files

    // check projectId member is editor
    // checkout branch
    // check last commit === commit
    // find rest git changed files
    // read rest git changed files
    // write files
    // validate
    // send back rest changed files & validation result

    // receive rest changed files
    // write rest changed files
    // log result
  }
}
