/**
 * A process mock for the web
 *
 * @packageDocumentation
 * @internal
 */

export const version = process.version
export const argv = ["node", "play.ts"]
export const execArgv = [] as any[]
export const exitCode = 0
export const fake = true
export const on = () => {}
export const once = () => {}
export const exit = function (code = 0) {
  if (code > 0) {
    return console.debug(
      `[playground process exiting with code ${code} - usually a fatal error]`,
    )
  }
  console.debug(`[process exiting with code ${code}]`)
}
