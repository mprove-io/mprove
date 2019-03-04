// import * as nodegit from 'nodegit';
// import { CONFIG_DISK_BASE_PATH } from '../../configs/config';

// export async function gitAddPathToStage(item: { project_id: string, repo_id: string, absolute_path: string }) {

//   let repoPath = `${CONFIG_DISK_BASE_PATH}/${item.project_id}/${item.repo_id}`;

//   let gitRepo = await nodegit.Repository.open(repoPath);

//   let index = await gitRepo.index();

//   let repoDirPathLength = repoPath.length;

//   let relativePath = item.absolute_path.substring(repoDirPathLength + 1);

//   await index.addByPath(relativePath);

//   await <any>index.write(); // wrong @types - method is async

//   await index.writeTree();
// }
