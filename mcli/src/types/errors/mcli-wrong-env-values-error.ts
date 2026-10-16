import type { ValidationIssue } from '#mcli/types/validation-issue';

export type McliWrongEnvValuesError = {
  code: 'MCLI_WRONG_ENV_VALUES';
  displayData: ValidationIssue[];
};
