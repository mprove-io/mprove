// import {
//   config, constants, enums, interfaces, blockml, controller, copier,
//   disk, generator, git, github, handler, helper, middleware, proc,
//   scheduler, sender, start, store, entities, repositories, validator,
//   wrapper, swagger
// } from '../../barrels';

// export async function createProjectRepo(projectId: string) {

//   await github.constantOctokitAuth.repos
//     .createForOrg({ // throws error if already exists
//       org: config.GITHUB_ORG,
//       name: projectId,
//       auto_init: true,
//       private: true
//     })
//     .catch(e => helper.reThrow(e, enums.githubErrorsEnum.GIT_CREATE_PROJECT_REPO));
// }
