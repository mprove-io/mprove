import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.MessageEntity)
export class MessageRepository extends Repository<entities.MessageEntity> {
}
