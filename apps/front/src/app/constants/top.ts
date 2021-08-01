import { common } from '~front/barrels/common';

export const SPECIAL_ERROR = 'SPECIAL_ERROR';
export const PASSWORD_RESET_EMAIL = 'PASSWORD_RESET_EMAIL';
export const MIN_TIME_TO_SPIN = 1000;

export const LOCAL_STORAGE_TOKEN = 'token';
export const LOCAL_STORAGE_ORG_ID = 'orgId';
export const LOCAL_STORAGE_PROJECT_ID = 'projectId';
export const LOCAL_STORAGE_DELETED_ORG_NAME = 'deletedOrgName';
export const LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME = 'changedOwnerOrgName';
export const LOCAL_STORAGE_DELETED_PROJECT_NAME = 'deletedProjectName';
export const LOCAL_STORAGE_NEW_ORG_OWNER = 'newOrgOwner';

export const MEMBERS_PER_PAGE = 10;
export const USERS_PER_PAGE = 10;
export const CONNECTIONS_PER_PAGE = 10;

export const EXT_LIST: common.FileExtensionEnum[] = [
  common.FileExtensionEnum.View,
  common.FileExtensionEnum.Model,
  common.FileExtensionEnum.Dashboard,
  common.FileExtensionEnum.Viz,
  common.FileExtensionEnum.Udf,
  common.FileExtensionEnum.Conf,
  common.FileExtensionEnum.Md
];

export const APP_SPINNER_NAME = 'app';
