import * as nodegit from 'nodegit';
import { config } from '../../barrels/config';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

export async function addChangesToStage(item: {
  project_id: string;
  repo_id: string;
  // absolute_path: string
}) {
  let repoPath = `${config.DISK_BASE_PATH}/${item.project_id}/${item.repo_id}`;

  let gitRepo = <nodegit.Repository>(
    await nodegit.Repository.open(repoPath).catch(e =>
      helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN)
    )
  );

  let index = <nodegit.Index>(
    await gitRepo
      .index()
      .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_INDEX))
  );

  // let repoDirPathLength = repoPath.length;

  // let relativePath = item.absolute_path.substring(repoDirPathLength + 1);

  await (<any>index
    .addAll(null, null) // await <any>index.addAll(relativePath, null);
    .catch(e =>
      helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_ADD_ALL)
    ));

  await (<any>index.write()) // wrong @types - method is async
    .catch((e: any) =>
      helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_WRITE)
    );

  await index
    .writeTree()
    .catch(e =>
      helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_INDEX_WRITE_TREE)
    );
}
