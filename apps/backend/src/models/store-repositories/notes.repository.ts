import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.NoteEntity)
export class NotesRepository extends Repository<entities.NoteEntity> {}
