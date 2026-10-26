const fs = require('fs')
const path = require('path')
const {spawnSync} = require('child_process')
const dotenv = require('dotenv')

const root = path.resolve(__dirname, '..')
const local = dotenv.parse(fs.readFileSync(path.join(root, '.env')))
const publicConfig = Object.fromEntries(
  Object.entries(local).filter(([key]) => key.startsWith('REACT_APP_'))
)
const apiUrl = publicConfig.REACT_APP_API_URL || 'http://localhost:8080/api/v1'
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(apiUrl).hostname)) {
  throw new Error('build:local requiere una API de localhost en .env')
}
const result = spawnSync(process.execPath, [require.resolve('react-scripts/scripts/build')], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    ...publicConfig,
    REACT_APP_API_URL: apiUrl,
    REACT_APP_SENTRY_DSN: '',
    REACT_APP_SENTRY_ENVIRONMENT: 'local',
    BUILD_PATH: 'build-local',
    GENERATE_SOURCEMAP: 'false',
    CI: 'false',
  },
})
if (result.error) throw result.error
process.exit(result.status ?? 1)
