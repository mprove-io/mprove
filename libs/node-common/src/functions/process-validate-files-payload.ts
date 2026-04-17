import { getBuilderUrl } from '#common/functions/get-builder-url';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors';
import type { ToBackendValidateFilesResponsePayload } from '#common/zod/to-backend/files/to-backend-validate-files';

export function processValidateFilesPayload(item: {
  payload: ToBackendValidateFilesResponsePayload;
  host: string;
  projectId: string;
  branch: string;
  env: string;
}) {
  let { payload, host, projectId, branch, env } = item;

  return {
    needValidate: payload.needValidate,
    validationErrorsTotal: payload.struct.errors.length,
    validationErrors: mapBmlErrorsToMproveValidationErrors({
      errors: payload.struct.errors
    }),
    repo: {
      orgId: payload.repo.orgId,
      projectId: payload.repo.projectId,
      repoId: payload.repo.repoId,
      currentBranchId: payload.repo.currentBranchId,
      repoStatus: payload.repo.repoStatus,
      conflicts: payload.repo.conflicts
    },
    url: getBuilderUrl({
      host: host,
      orgId: payload.repo.orgId,
      projectId: projectId,
      repoId: payload.repo.repoId,
      branch: branch,
      env: env
    })
  };
}
