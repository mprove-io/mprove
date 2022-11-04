import { common } from '~front/barrels/common';

export const SPECIAL_ERROR = 'SPECIAL_ERROR';
export const PASSWORD_RESET_EMAIL = 'PASSWORD_RESET_EMAIL';
export const MIN_TIME_TO_SPIN = 0;

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
export const ENVIRONMENTS_PER_PAGE = 10;

export const DEFAULT_LANGUAGE_NAME = 'markdown';
export const DEFAULT_THEME_NAME = 'textmate';

export const BLOCKML_LANGUAGE_NAME = 'yaml';
export const BLOCKML_TEXTMATE_THEME_NAME = 'blockml-textmate';

export const YAML_EXT_LIST: common.FileExtensionEnum[] = [
  common.FileExtensionEnum.View,
  common.FileExtensionEnum.Model,
  common.FileExtensionEnum.Dashboard,
  common.FileExtensionEnum.Vis,
  common.FileExtensionEnum.Udf,
  common.FileExtensionEnum.Yml
];

export const RESULT_LIST: common.FieldResultEnum[] = [
  common.FieldResultEnum.String,
  common.FieldResultEnum.Number,
  common.FieldResultEnum.Yesno,
  common.FieldResultEnum.Ts,
  common.FieldResultEnum.QuarterOfYear,
  common.FieldResultEnum.MonthName,
  common.FieldResultEnum.DayOfWeek,
  common.FieldResultEnum.DayOfWeekIndex
];

export const APP_SPINNER_NAME = 'app';

export const FORMAT_NUMBER_DECIMAL = '.';
export const FORMAT_NUMBER_THOUSANDS = ' ';
export const FORMAT_NUMBER_GROUPING = [3];
