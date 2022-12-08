import { Command, Option } from 'clipanion';
import * as fse from 'fs-extra';
import * as nodegit from 'nodegit';
import { forEachSeries } from 'p-iteration';
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

    let deletedFiles: any[] = [];
    let changedFiles: any[] = [];

    await forEachSeries(
      statusFiles,

      // statusFiles.forEach(
      async (x: nodegit.StatusFile) => {
        let path = x.path();
        // let pathArray = path.split('/');
        // let fileId = pathArray.join(common.TRIPLE_UNDERSCORE);
        // let fileName = pathArray.slice(-1)[0];
        // let parentPath =
        //   pathArray.length === 1 ? '' : pathArray.slice(0, -1).join('/');

        let status = x.isNew()
          ? common.FileStatusEnum.New
          : x.isDeleted()
          ? common.FileStatusEnum.Deleted
          : x.isModified()
          ? common.FileStatusEnum.Modified
          : x.isConflicted()
          ? common.FileStatusEnum.Conflicted
          : x.isTypechange()
          ? common.FileStatusEnum.TypeChange
          : x.isRenamed()
          ? common.FileStatusEnum.Renamed
          : x.isIgnored()
          ? common.FileStatusEnum.Ignored
          : undefined;

        let content: string;
        if (status !== common.FileStatusEnum.Deleted) {
          let fullPath = `${repoDir}/${path}`;

          content = <string>await fse.readFile(fullPath, 'utf8');
        }

        let change = {
          // fileName: fileName,
          // fileId: fileId,
          // parentPath: parentPath,
          path: path,
          // doesn't return booleans
          status: status,
          content: content
        };

        if (change.status === common.FileStatusEnum.Deleted) {
          deletedFiles.push(change);
        } else {
          changedFiles.push(change);
        }
      }
    );

    logToConsoleMcli({
      log: {
        repoDir: repoDir,
        deletedFiles: deletedFiles,
        changedFiles: changedFiles
      },
      // log: statusFiles.map(x => x.path()),
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
