import { createWriteStream, DelimiterFormatter, FileWriter } from 'io-one';
import { Exporter, ExportService, Statement } from 'oracle-core';
import OracleDB from 'oracledb';
import { User, userModelAttributes } from './user';

const DB_HOST = '';
const DB_PORT = 1525;
const DB_SRV_NAME = '';
const DB_USR = '';
const DB_PWD = '#55';
const USE_SERVICE = true;

export class QueryBuilder {
  build = (): Promise<Statement> => Promise.resolve({
    query: `
      SELECT * FROM users WHERE userid = :1
    `,
    params: ['0001']
  })
}

async function main() {
  const dir = './dest_dir/';
  const writeStream = createWriteStream(dir, 'export.csv');
  const writer = new FileWriter(writeStream);
  const queryBuilder = new QueryBuilder();
  const formatter = new DelimiterFormatter('|', userModelAttributes);
  let connection: any;
  try {
    connection = await OracleDB.getConnection({
      user: DB_USR,
      password: DB_PWD,
      connectionString: `(
        DESCRIPTION =
          (ADDRESS = (PROTOCOL=TCP) (Host=${DB_HOST}) (Port=${DB_PORT}))
          (CONNECT_DATA = (SERVICE_NAME=${DB_SRV_NAME}))
      )`
    });
    const exporter = USE_SERVICE
      ? new ExportService<User>(
          connection,
          userModelAttributes,
          queryBuilder,
          formatter,
          writer
        )
      : new Exporter<User>(
          connection,
          userModelAttributes,
          queryBuilder.build,
          formatter.format,
          writer.write,
          writer.end
        );
    await exporter.export();
  } catch (err) {
    // handleError(err)
    console.error(err);
  }
}

main();
