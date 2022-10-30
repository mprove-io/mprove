import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class StructsRepository extends Repository<entities.StructEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.StructEntity, dataSource.createEntityManager());
  }
}
