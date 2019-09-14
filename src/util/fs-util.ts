import fs from 'fs-extra'
import yaml from 'js-yaml'
import { logger } from './logger'


/**
 * check whether p is a file path.
 *
 * @param p   file path
 * @return a boolean value whether p is a file path or not.
 */
export async function isFile(p: string | null): Promise<boolean> {
  if (p == null) return false
  if (!fs.existsSync(p)) return false
  const stat = await fs.stat(p)
  return stat.isFile()
}


/**
 * check whether p is a file path. (synchronizing)
 *
 * @param p   file path
 * @return a boolean value whether p is a file path or not.
 */
export function isFileSync(p: string | null): boolean {
  if (p == null) return false
  if (!fs.existsSync(p)) return false
  const stat = fs.statSync(p)
  return stat.isFile()
}


/**
 * ensure p is a valid file path.
 *
 * @param p
 * @param message
 */
export async function ensureFilePath(p: string | null): Promise<void | never> {
  if (p == null) {
    logger.error('invalid path: null.')
    process.exit(-1)
  }
  if (!fs.existsSync(p!)) {
    logger.error(`${ p } is not found.`)
    process.exit(-1)
  }
  if (await isFile(p)) return
  logger.error(`${ p } is not a file.`)
  process.exit(-1)
}


/**
 * ensure p is a valid file path. (synchronizing)
 *
 * @param p
 * @param message
 */
export function ensureFilePathSync(p: string | null): void | never {
  if (p == null) {
    logger.error('invalid path: null.')
    process.exit(-1)
  }
  if (!fs.existsSync(p!)) {
    logger.error(`${ p } is not found.`)
    process.exit(-1)
  }
  if (isFileSync(p)) return
  logger.error(`${ p } is not a file.`)
  process.exit(-1)
}



export function loadConfigDataSync(configPath: string, encoding: string): any | never {
  const rawContent: string = fs.readFileSync(configPath, encoding)

  // json format
  if (/\.json$/.test(configPath)) return JSON.parse(rawContent)

  // yaml format
  if (/\.(yml|yaml)$/.test(configPath)) return yaml.safeLoad(rawContent)

  // unsupported config file
  throw new Error(`${ configPath } must be a file which the extension is .json/.yml/.yaml`)
}
