import { merge } from "config-plus"
import dotenv from "dotenv"
import { createWriteStream, CSVFormatter, FileWriter, getPrefix, LogWriter, timeToString, toString } from "export-kit"
import { createFileLogger } from "logger-core"
import { ExportService, select, Statement } from "oracle-core"
import oracledb from "oracledb"
import path from "path"
import { config, environments } from "./config"
import { User, userModel } from "./user"

export class QueryBuilder {
  constructor() {
    this.build = this.build.bind(this)
  }
  build(cxt?: any): Promise<Statement> {
    const stmt: Statement = { query: select("PDBADMIN.export_users", userModel) }
    return Promise.resolve(stmt)
  }
}

dotenv.config()
const cfg = merge(config, process.env, environments, process.env.ENV)

async function exportData() {
  const now = new Date()
  const errorWriter = new LogWriter(`${getPrefix(cfg.error.prefix, now)}_${timeToString(now)}${cfg.error.suffix}`, cfg.error.directory)
  const logWriter = new LogWriter(`${getPrefix(cfg.info.prefix, now)}_${timeToString(now)}${cfg.info.suffix}`, cfg.info.directory)

  const logger = createFileLogger(cfg.log, errorWriter.write, logWriter.write)

  const connection = await oracledb.getConnection(cfg.db)
  const formatter = new CSVFormatter<User>(userModel, ",")
  const queryBuilder = new QueryBuilder()

  const dir = cfg.file.path
  const filename = `${getPrefix(cfg.file.prefix, now)}_${timeToString(now)}.csv`
  const writeStream = createWriteStream(dir, filename)
  const writer = new FileWriter(writeStream)

  try {
    logger.info(`Start to export "${path.join(dir, filename)}" file`)
    writer.write(cfg.file.header)
    const exporter = new ExportService<User>(connection, filename, userModel, queryBuilder, formatter, writer, logger.info, 3)
    const total = await exporter.export()

    console.log(`Export "${path.join(dir, filename)}" file. Total: ${total}`)
    logger.info(`Export "${path.join(dir, filename)}" file. Total: ${total}`)
  } catch (err) {
    logger.error(`Error when export "${path.join(dir, filename)}" file. Details: ${toString(err)}`)
  } finally {
    errorWriter.end()
    logWriter.end()
  }
}

exportData()
