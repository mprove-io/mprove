import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class AvatarsRepository extends Repository<entities.AvatarEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.AvatarEntity, dataSource.createEntityManager());
  }
}
