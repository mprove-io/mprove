import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { constants } from '../../barrels/constants';
import { disk } from '../../barrels/disk';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import * as fse from 'fs-extra';

export async function createInitialCommitToProd(item: {
  project_id: string;
  use_data: boolean;
}) {
  let dirProd = `${config.DISK_BASE_PATH}/${item.project_id}/${
    constants.PROD_REPO_ID
  }`;

  let gitRepo = <nodegit.Repository>(
    await nodegit.Repository.open(dirProd).catch(e =>
      helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN)
    )
  );

  let sourcePath = `test-projects/${item.project_id}`;

  let isSourcePathExist = await fse
    .pathExists(sourcePath)
    .catch(e => helper.reThrow(e, enums.fseErrorsEnum.FSE_PATH_EXISTS_CHECK));

  if (item.use_data && isSourcePathExist) {
    await disk
      .copyPath({
        source_path: `test-projects/${item.project_id}`,
        destination_path: dirProd
      })
      .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_WRITE_TO_FILE));
  } else {
    let fileName = 'readme.md';
    let fileAbsoluteId = `${dirProd}/${fileName}`;
    let content = `# ${item.project_id}`;

    await disk
      .writeToFile({
        file_absolute_id: fileAbsoluteId,
        content: content
      })
      .catch(e => helper.reThrow(e, enums.diskErrorsEnum.DISK_WRITE_TO_FILE));
  }

  let index = <nodegit.Index>(
    await gitRepo
      .refreshIndex()
      .catch(e =>
        helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_REFRESH_INDEX)
      )
  );

  await index
    // .addByPath(fileName)
    .addAll(undefined, undefined)
    .catch(e =>
      helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_ADD_BY_PATH)
    );

  await (<any>index.write()) // wrong @types - method is async
    .catch((e: any) =>
      helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_WRITE)
    );

  let oid = <nodegit.Oid>(
    await index
      .writeTree()
      .catch(e =>
        helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_WRITE_TREE)
      )
  );

  let author = nodegit.Signature.now('mprove server', '@');
  let committer = nodegit.Signature.now('mprove server', '@');

  // Since we're creating an inital commit, it has no parents. Note that unlike
  // normal we don't get the head either, because there isn't one yet.
  await gitRepo
    .createCommit('HEAD', author, committer, 'message', oid, [])
    .catch(e =>
      helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_CREATE_COMMIT)
    );
}
