import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class UsersRepository extends Repository<entities.UserEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.UserEntity, dataSource.createEntityManager());
  }
}
