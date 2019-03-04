import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { store } from '../../barrels/store';

export async function findDifferencesInFiles(item: {
  project_id: string,
  repo_id: string,
  repo_disk_files: entities.FileEntity[],
}): Promise<interfaces.ItemFiles> {

  let storeFiles = store.getFilesRepo();

  let databaseFiles = <entities.FileEntity[]>await storeFiles.find({
    project_id: item.project_id,
    repo_id: item.repo_id,
    deleted: enums.bEnum.FALSE
  })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_FIND));

  let deletedFiles: entities.FileEntity[] = [];
  let changedFiles: entities.FileEntity[] = [];
  let newFiles: entities.FileEntity[] = [];

  databaseFiles.forEach(databaseFile => {
    let diskFile = item.repo_disk_files.find(file => file.file_absolute_id === databaseFile.file_absolute_id);

    if (diskFile) {
      if (diskFile.content !== databaseFile.content) {
        // changed
        changedFiles.push(diskFile);
      }

    } else {
      // deleted
      databaseFile.deleted = enums.bEnum.TRUE;
      deletedFiles.push(databaseFile);
    }
  });

  item.repo_disk_files.forEach(diskFile => {
    let databaseFile = databaseFiles.find(file => file.file_absolute_id === diskFile.file_absolute_id);

    if (!databaseFile) {
      // new
      newFiles.push(diskFile);
    }
  });

  return {
    deleted_files: deletedFiles,
    changed_files: changedFiles,
    new_files: newFiles,
  };
}
