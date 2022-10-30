import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class NotesRepository extends Repository<entities.NoteEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.NoteEntity, dataSource.createEntityManager());
  }
}
