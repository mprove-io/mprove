import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER
} from '#common/constants/top';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';

export function getUserReportsParentNodeId(item: {
  projectId: string;
  mproveDirValue: string;
  userAlias: string;
}) {
  // Example: project "p1", mprove_dir "./data", alias "john" targets "p1/data/mprove-users/john".
  let { projectId, mproveDirValue, userAlias } = item;

  // Example: keep raw mprove_dir value before normalizing "./data".
  let mdir = mproveDirValue;

  // Example: detect the "./" prefix in "./data".
  let hasDotSlashPrefix =
    mdir.length > 2 && mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH;

  // Example: convert "./data" to "data" for file node ids.
  if (hasDotSlashPrefix) {
    mdir = mdir.substring(2);
  }

  // Example: "./" means the project root is the mprove directory.
  let isRootMproveDir = mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH;

  // Example: root mprove_dir targets "p1/mprove-users/john".
  if (isRootMproveDir) {
    return `${projectId}/${MPROVE_USERS_FOLDER}/${userAlias}`;
  }

  // Example: non-empty normalized mdir "data" targets inside "p1/data".
  if (isDefinedAndNotEmpty(mdir)) {
    return `${projectId}/${mdir}/${MPROVE_USERS_FOLDER}/${userAlias}`;
  }

  // Example: empty mprove_dir falls back to root user reports folder.
  return `${projectId}/${MPROVE_USERS_FOLDER}/${userAlias}`;
}
