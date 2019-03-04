// import {
//   config, constants, enums, interfaces, blockml, controller, copier,
//   disk, generator, git, github, handler, helper, middleware, proc,
//   scheduler, sender, start, store, entities, repositories, validator,
//   wrapper, swagger
// } from '../../barrels';

// import * as nodegit from 'nodegit';

// // not used

// export async function getDiffLocalToOriginAbsoluteIds(item: {
//   project_id: string,
//   repo_id: string
// }) {

//   // let conflicts: FileLine[] = [];

//   let repoPath = `${config.DISK_BASE_PATH}/${item.project_id}/${item.repo_id}`;

//   let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoPath)
//       .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_OPEN));

//   // let index = await gitRepo.index();

//   const head = <nodegit.Commit> await gitRepo.getHeadCommit()
//       .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_HEAD_COMMIT));

//   let headTree = <nodegit.Tree>await head.getTree()
//       .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_COMMIT_GET_TREE));

//   let remoteOriginCommit = <nodegit.Commit>await gitRepo.getReferenceCommit('refs/remotes/origin/master')
//       .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_REPO_GET_REFERENCE_COMMIT));


//   let originTree = <nodegit.Tree>await remoteOriginCommit.getTree()
//       .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_COMMIT_GET_TREE));

//   const diffLocalToOrigin = <nodegit.Diff>await nodegit.Diff.treeToTree(gitRepo, headTree, originTree, null)
//       .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_DIFF_TREE_TO_TREE));

//   const patches = <nodegit.ConvenientPatch[]>await diffLocalToOrigin.patches()
//       .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_COMMIT_GET_TREE));

//   let newPaths: string[] = [];
//   let modifiedPaths: string[] = [];
//   let deletedPaths: string[] = [];

//   patches.forEach(patch => {

//     if (patch.isAdded()) {

//       newPaths.push(
//         patch
//           .newFile()
//           .path()
//       );

//     } else if (patch.isModified()) {

//       modifiedPaths.push(
//         patch
//           .newFile()
//           .path()
//       );

//     } else if (patch.isDeleted()) {

//       deletedPaths.push(
//         patch
//           .oldFile()
//           .path()
//       );
//     }
//   });
// }
