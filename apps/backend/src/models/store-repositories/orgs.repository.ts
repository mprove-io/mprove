import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class OrgsRepository extends Repository<entities.OrgEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.OrgEntity, dataSource.createEntityManager());
  }
}
