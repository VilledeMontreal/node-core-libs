// tslint:disable:no-console

(async () => {
  const args = process.argv.slice(2);

  console.info(`in dummy - info`);
  console.error(`in dummy - error`);

  const action = args.length > 0 ? args[0] : undefined;

  if (action === 'customExitCode') {
    const customExitCode = Number(args[1]);
    process.exit(customExitCode);
  }

  if (action === 'error') {
    throw new Error(`Some error`);
  }
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
