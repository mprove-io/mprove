import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';

export function makeFile(item: {
  file_absolute_id: string,
  file_id: string,
  project_id: string,
  repo_id: string,
  path: string,
  name: string,
  content: string,
}): entities.FileEntity {

  return {
    file_absolute_id: item.file_absolute_id,
    file_id: item.file_id,
    project_id: item.project_id,
    repo_id: item.repo_id,
    path: item.path,
    name: item.name,
    content: item.content,
    deleted: enums.bEnum.FALSE,
    server_ts: undefined
  };
}
