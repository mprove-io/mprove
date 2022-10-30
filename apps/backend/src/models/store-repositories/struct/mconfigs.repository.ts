import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class MconfigsRepository extends Repository<entities.MconfigEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.MconfigEntity, dataSource.createEntityManager());
  }
}
