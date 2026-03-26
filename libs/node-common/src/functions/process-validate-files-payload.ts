import { getBuilderUrl } from '#common/functions/get-builder-url';
import type { ToBackendValidateFilesResponsePayload } from '#common/interfaces/to-backend/files/to-backend-validate-files';

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
    validationErrors: payload.struct.errors.map(e => ({
      title: e.title,
      message: e.message
    })),
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
