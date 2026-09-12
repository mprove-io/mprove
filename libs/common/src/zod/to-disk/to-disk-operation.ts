import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

const toDiskOperations = [
  'createOrg',
  'deleteOrg',
  'isOrgExist',
  'createProject',
  'deleteProject',
  'isProjectExist',
  'commitRepo',
  'createDevRepo',
  'deleteDevRepo',
  'mergeRepo',
  'pullRepo',
  'pushRepo',
  'revertRepoToLastCommit',
  'revertRepoToRemote',
  'syncRepo',
  'getCatalogFiles',
  'getCatalogNodes',
  'moveCatalogNode',
  'renameCatalogNode',
  'createBranch',
  'deleteBranch',
  'isBranchExist',
  'createFolder',
  'deleteFolder',
  'createFile',
  'deleteFile',
  'getFile',
  'saveFile',
  'seedProject',
  'cloneTestRepo'
] as const;

export type ToDiskOperation = (typeof toDiskOperations)[number];

export let zToDiskOperation = z.enum(toDiskOperations);

assertTypesEqual<ToDiskOperation, z.infer<typeof zToDiskOperation>>({
  value: true
});
