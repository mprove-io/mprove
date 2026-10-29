import type snowflake from 'snowflake-sdk';

export async function snowflakeConnectionExecute(item: {
  sfConnection: snowflake.Connection;
  execOptions: any;
}): Promise<any> {
  let { sfConnection, execOptions } = item;

  let execution: Promise<any> = new Promise((resolve, reject) => {
    sfConnection.execute({
      ...execOptions,
      complete: function (err, stmt, rows) {
        if (err) {
          reject(err);
        } else {
          resolve({ stmt: stmt, rows: rows });
        }
      }
    });
  });

  return execution;
}
