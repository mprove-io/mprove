import { entities } from '../barrels/entities';

export interface ItemFiles {
  deleted_files: entities.FileEntity[];
  changed_files: entities.FileEntity[];
  new_files: entities.FileEntity[];
}
