import path from 'path'
import convict from 'convict'
import url from 'url'

const config = convict({
  env: {
    doc: 'The application environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  server: {
    port: {
      doc: 'The server port number',
      format: 'port',
      default: 3000,
      env: 'PORT',
    },
    logFormat: {
      doc: 'The morgan log format to use',
      format: ['dev', 'combined', 'common', 'short', 'tiny', ''],
      default: 'dev',
    },
    secure: {
      doc: 'Specify if the server is using https or not.',
      format: Boolean,
      default: false,
    },
  },
  pg: {
    client: {
      doc: 'Knex client',
      format: String,
      default: 'postgresql',
    },
    connection: {
      host: {
        doc: 'Postgres user',
        format: String,
        default: 'localhost',
      },
      user: {
        doc: 'Postgres user',
        format: String,
        default: 'postgres',
      },
      database: {
        doc: 'Postgres database',
        format: String,
        default: 'development',
      },
    },
  },
  amqp: {
    url: {
      doc: 'RabbitMQ url',
      format: String,
      default: 'amqp://localhost',
      env: 'CLOUDAMQP_URL',
    },
  },
  s3: {
    accessKeyId: {
      doc: 'AWS S3 access key id',
      format: String,
      default: '',
      env: 'S3_ACCESS_KEY',
    },
    secretAccessKey: {
      doc: 'AWS S3 secret access key',
      format: String,
      default: '',
      env: 'S3_SECRET_KEY',
    },
  },
  github: {
    appId: {
      doc: 'App ID',
      format: String,
      default: '',
      env: 'GITHUB_APP_ID',
    },
    privateKey: {
      doc: 'Private key',
      format: String,
      default: '',
      env: 'GITHUB_APP_PRIVATE_KEY',
    },
    clientId: {
      doc: 'Client ID',
      format: String,
      default: '',
      env: 'GITHUB_CLIENT_ID',
    },
    clientSecret: {
      doc: 'Client Secret',
      format: String,
      default: '',
      env: 'GITHUB_CLIENT_SECRET',
    },
  },
  sentry: {
    environment: {
      doc: 'Sentry environment',
      format: String,
      default: 'development',
      env: 'NODE_ENV',
    },
    dsn: {
      doc: 'Sentry DSN',
      format: String,
      default: '',
      env: 'SENTRY_SERVER_DSN',
    },
    release: {
      doc: 'Sentry release version',
      format: String,
      default: '',
      env: 'HEROKU_SLUG_COMMIT',
    },
  },
})

const env = config.get('env')
config.loadFile(path.join(__dirname, `../config/${env}.json`))
config.validate()

if (process.env.DATABASE_URL) {
  const urlParts = url.parse(process.env.DATABASE_URL)
  const [user, password] = urlParts.auth.split(':')

  config.set('pg.connection.host', urlParts.hostname)
  config.set('pg.connection.port', urlParts.port)
  config.set('pg.connection.user', user)
  config.set('pg.connection.password', password)
  config.set('pg.connection.database', urlParts.path.substring(1))
  config.set('pg.connection.ssl', true)
  config.set('pg.connection.timezone', 'utc')
}

export default config
