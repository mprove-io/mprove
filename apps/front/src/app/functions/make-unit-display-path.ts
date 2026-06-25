import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER
} from '#common/constants/top';
import { EMPTY_SPACE_NAME } from '#common/constants/top-front';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import type { Space } from '#common/zod/blockml/space';

export function makeUnitDisplayPath(item: {
  projectId: string;
  mproveDirValue: string;
  userAlias: string;
  selectedSpace: string;
  unitId: string;
  filePath: string;
  unitSpace: string;
  extension: FileExtensionEnum;
  spaces: Space[];
}) {
  let {
    projectId,
    mproveDirValue,
    userAlias,
    selectedSpace,
    unitId,
    filePath,
    unitSpace,
    extension,
    spaces
  } = item;

  let normalizedSelectedSpace = isUndefined(selectedSpace)
    ? EMPTY_SPACE_NAME
    : selectedSpace;

  let normalizedUnitSpace = isUndefined(unitSpace)
    ? EMPTY_SPACE_NAME
    : unitSpace;

  if (
    isDefinedAndNotEmpty(filePath) &&
    normalizedSelectedSpace === normalizedUnitSpace
  ) {
    return makeDisplayPath({ filePath: filePath });
  }

  let parentNodeId = makeUserUnitsParentNodeId({
    projectId: projectId,
    mproveDirValue: mproveDirValue,
    userAlias: userAlias
  });

  if (normalizedSelectedSpace !== EMPTY_SPACE_NAME) {
    let selectedSpace = spaces.find(x => x.space === normalizedSelectedSpace);

    if (isDefined(selectedSpace)) {
      let selectedSpaceFilePathParts = selectedSpace.filePath.split('/');

      let selectedSpaceFolderParts = selectedSpaceFilePathParts.slice(0, -1);

      let selectedSpaceFileName = selectedSpaceFilePathParts[
        selectedSpaceFilePathParts.length - 1
      ].replace(FileExtensionEnum.Space, '');

      let spaceParts = selectedSpace.space.split('.');

      let childSpaceParts =
        spaceParts[0] === selectedSpaceFileName
          ? spaceParts.slice(1)
          : spaceParts;

      let targetFolderParts = [...selectedSpaceFolderParts, ...childSpaceParts];

      parentNodeId = targetFolderParts.join('/');
    }
  }

  if (isUndefined(parentNodeId)) {
    return '';
  }

  return makeDisplayPath({
    filePath: `${parentNodeId}/${unitId}${extension}`
  });
}

function makeUserUnitsParentNodeId(item: {
  projectId: string;
  mproveDirValue: string;
  userAlias: string;
}) {
  let { projectId, mproveDirValue, userAlias } = item;

  let mdir = mproveDirValue;

  let hasDotSlashPrefix =
    mdir.length > 2 && mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH;

  if (hasDotSlashPrefix) {
    mdir = mdir.substring(2);
  }

  if (mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH) {
    return `${projectId}/${MPROVE_USERS_FOLDER}/${userAlias}`;
  }

  if (mdir !== '') {
    return `${projectId}/${mdir}/${MPROVE_USERS_FOLDER}/${userAlias}`;
  }

  return `${projectId}/${MPROVE_USERS_FOLDER}/${userAlias}`;
}

function makeDisplayPath(item: { filePath: string }) {
  let { filePath } = item;

  let parts = filePath.split('/');

  parts.shift();

  return parts.join(' / ');
}
