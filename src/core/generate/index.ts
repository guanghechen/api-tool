import path from 'path'
import commander from 'commander'
import { GlobalOptions } from '@/types'
import { logger } from '@/util/logger'
import { isNotBlankString } from '@/util/type-util'
import { ApiToolGeneratorContext, ApiToolGeneratorContextParams, parseApiToolGeneratorContextParams } from './context'
import { ApiToolGenerator } from './generator'
export { ApiToolGeneratorContext, ApiToolGeneratorContextParams, parseApiToolGeneratorContextParams } from './context'
export { ApiToolGenerator } from './generator'


/**
 * generate 命令的参数选项
 *
 * @member tsconfigPath       tsconfig.json 所在的路径
 * @member schemaRootPath     生成的 Json-Schema 存放的文件夹
 * @member apiItemConfigPath  定义 ApiItems 的文件路径（yaml 格式）
 * @member configPath         json 格式的配置文件，通过此文件构造 ApiToolGeneratorContextParams（低优先级）；
 *                            此配置文件内容与 ApiToolGeneratorContextParams 类型保持一直，用来指定改变 generator 行为的参数
 */
export interface GenerateOptions {
  tsconfigPath: string
  schemaRootPath: string
  apiItemConfigPath: string
  configPath: string
}


export function loadGenerateCommand (program: commander.Command, globalOptions: GlobalOptions) {
  program
    .command('generate <project-dir>')
    .alias('g')
    .option('-p, --tsconfig <tsconfig-path>', 'specify the location (absolute or relative to the projectDir) of typescript config file.', 'tsconfig.json')
    .option('-s, --schema-root-path <schema-root-path>', 'specify the root directory (absolute or relative to the projectDir) to save schemas.', 'data/schemas')
    .option('-i, --api-item-config <api-item-config-path>', 'specify the location (absolute or relative to the projectDir) of file contains apiItems.', 'api.yml')
    .option('-c, --config <config-path>', 'specify generate-config.json (absolute or relative to the projectDir) to create context params (lower priority)', 'api-generate-config.json')
    .action(async function (projectDir: string, options: GenerateOptions) {
      const cwd = globalOptions.cwd.value

      logger.debug('[generate] cwd:', cwd)
      logger.debug('[generate] rawProjectDir:', projectDir)

      projectDir = path.resolve(cwd, projectDir)
      const resolvePath = (key: keyof GenerateOptions, defaultValue: string) => {
        if (isNotBlankString(options[key])) return path.resolve(projectDir, options[key])
        return path.resolve(projectDir, defaultValue)
      }

      const configPath = resolvePath('configPath', 'api-generate-config.json')
      const contextParams: Partial<ApiToolGeneratorContextParams> = parseApiToolGeneratorContextParams(configPath)
      const tsconfigPath = resolvePath('tsconfigPath', contextParams.tsconfigPath || 'tsconfig.json')
      const schemaRootPath = resolvePath('schemaRootPath', contextParams.schemaRootPath || 'data/schemas')
      const apiItemConfigPath = resolvePath('apiItemConfigPath', contextParams.apiItemConfigPath || 'api.yml')
      const encoding = !globalOptions.encoding.userSpecified && isNotBlankString(contextParams.encoding)
        ? contextParams.encoding!
        : globalOptions.encoding.value

      logger.debug('[generate] encoding:', encoding)
      logger.debug('[generate] projectDir:', projectDir)
      logger.debug('[generate] configPath:', configPath)
      logger.debug('[generate] tsconfigPath:', tsconfigPath)
      logger.debug('[generate] schemaRootPath:', schemaRootPath)
      logger.debug('[generate] apiItemConfigPath:', apiItemConfigPath)
      logger.debug('[generate] globalOptions:', globalOptions)

     const context = new ApiToolGeneratorContext({
        ...contextParams,
        cwd,
        encoding,
        tsconfigPath,
        schemaRootPath,
        apiItemConfigPath
      })
      const generator = new ApiToolGenerator(context)
      await generator.generate()
    })
}
