// import {
//   config, constants, enums, interfaces, blockml, controller, copier,
//   disk, generator, git, github, handler, helper, middleware, proc,
//   scheduler, sender, start, store, entities, repositories, validator,
//   wrapper, swagger
// } from '../../barrels';

// import * as nodegit from 'nodegit';

// export async function cloneGithubToRepo(item: {
//   project_id: string,
//   repo_id: string
// }) {

//   let cloneURL = `https://github.com/${config.GITHUB_ORG}/${item.project_id}`;

//   let repoPath = `${config.DISK_BASE_PATH}/${item.project_id}/${item.repo_id}`;

//   let cloneOptions = { fetchOpts: git.constantFetchOptionsGithub };

//   await nodegit.Clone.clone(cloneURL, repoPath, cloneOptions)
//     .catch(e => helper.reThrow(e, enums.nodegitErrorsEnum.NODEGIT_CLONE));
// }

