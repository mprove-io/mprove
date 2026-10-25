import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pgPromise from 'pg-promise';
import type pg from 'pg-promise/typescript/pg-subset';
import type { BackendConfig } from '#backend/config/backend-config';

@Injectable()
export class CalcDbService implements OnModuleDestroy {
  readonly calcDb: pgPromise.IDatabase<unknown>;

  constructor(private cs: ConfigService<BackendConfig>) {
    let pgp: pgPromise.IMain = pgPromise({ noWarnings: true });

    let cn: pg.IConnectionParameters<pg.IClient> = {
      host: this.cs.get<BackendConfig['calcPostgresHost']>('calcPostgresHost'),
      port: this.cs.get<BackendConfig['calcPostgresPort']>('calcPostgresPort'),
      database: 'postgres',
      user: this.cs.get<BackendConfig['calcPostgresUsername']>(
        'calcPostgresUsername'
      ),
      password: this.cs.get<BackendConfig['calcPostgresPassword']>(
        'calcPostgresPassword'
      ),
      ssl: false
    };

    this.calcDb = pgp(cn);
  }

  async onModuleDestroy(): Promise<void> {
    await this.calcDb.$pool.end();
  }
}
