import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToApiFile(file: entities.FileEntity): api.CatalogFile {
  return {
    file_id: file.file_id,
    project_id: file.project_id,
    repo_id: file.repo_id,
    path: JSON.parse(file.path), // any
    name: file.name,
    content: file.content,
    deleted: helper.benumToBoolean(file.deleted),
    server_ts: Number(file.server_ts)
  };
}
