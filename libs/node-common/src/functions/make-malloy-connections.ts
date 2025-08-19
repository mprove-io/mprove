import { PostgresConnection } from '@malloydata/db-postgres';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';

export function makeMalloyConnections(item: {
  connections: ProjectConnection[];
}) {
  let malloyConnections: PostgresConnection[] = [];

  item.connections.forEach(c => {
    // TODO: more connection types

    let mConnection =
      c.type === ConnectionTypeEnum.PostgreSQL
        ? new PostgresConnection(c.connectionId, () => ({}), {
            host: c.host,
            port: c.port,
            username: c.username,
            password: c.password,
            databaseName: c.databaseName
          })
        : undefined;

    if (isDefined(mConnection)) {
      malloyConnections.push(mConnection);
    }

    return mConnection;
  });

  return malloyConnections;
}
