import { PostgresConnection } from '@malloydata/db-postgres';
import { common } from '~blockml/barrels/common';

export function makeMalloyConnections(item: {
  connections: common.ProjectConnection[];
}) {
  let malloyConnections: PostgresConnection[] = [];

  item.connections.forEach(c => {
    // TODO: more connection types

    let mConnection =
      c.type === common.ConnectionTypeEnum.PostgreSQL
        ? new PostgresConnection(c.connectionId, () => ({}), {
            host: c.host,
            port: c.port,
            username: c.username,
            password: c.password,
            databaseName: c.databaseName
          })
        : undefined;

    if (common.isDefined(mConnection)) {
      malloyConnections.push(mConnection);
    }

    return mConnection;
  });

  return malloyConnections;
}
