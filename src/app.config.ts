/**
 * @file app.config.ts
 * @module app.config
 * @author Devhoangkien <https://github.com/devhoangkien>
 */

import path from 'path'
import { argv } from 'yargs'

const ROOT_PATH = path.join(__dirname, '..')
const packageJSON = require(path.resolve(ROOT_PATH, 'package.json'))

export const APP = {
  PORT: 8000,
  ROOT_PATH,
  DEFAULT_CACHE_TTL: 60 * 60 * 24,
  MASTER: 'TheTricks',
  NAME: 'TheTricks-API',
  URL: 'http://localhost:3000',// url api server
  ADMIN_EMAIL: (argv.admin_email as string) || 'devhoangkien@gmail.com',//admin email, e.g. admin@example.com
  FE_NAME: 'TheTricks.Tips',
  FE_URL: 'http://localhost:8000',// url client frontend
  LOG_LEVEL: 'log,error,warn,debug,verbose'
}

export const SWAGGER = {
  SWAGGER_IS_SHOW: 'true',
  SWAGGER_USER: 'admin',
  SWAGGER_PASSWORD: 'admin',
  SWAGGER_PATH: '/swagger',
}

export const PROJECT = {
  name: packageJSON.name,
  version: packageJSON.version,
  author: packageJSON.author,
  //  homepage: packageJSON.homepage,
  //  documentation: packageJSON.documentation,
  //  issues: packageJSON.bugs.url,
}

export const CROSS_DOMAIN = {
  allowedOrigins: ['https://thetricks.tips', 'https://cdn.thetricks.tips', 'https://admin.thetricks.tips'],
  allowedReferer: 'thetricks.tips',
}

export const MONGO_DB = {
  uri: (argv.db_uri as string) || `mongodb://localhost:27017/thetricks`,
}

export const REDIS = {
  host: argv.redis_host || 'localhost',
  port: argv.redis_port || 6379,
  username: (argv.redis_username || null) as string,
  password: (argv.redis_password || null) as string,
}

export const AUTH = {
  expiresIn: argv.auth_expires_in || 3600,
  data: argv.auth_data || { user: 'root' },
  jwtTokenSecret: argv.auth_key || 'thetricksapi',
  defaultPassword: argv.auth_default_password || 'root',
}

export const EMAIL = {
  host: argv.email_host || 'smtp.gmail.com',
  account: argv.email_account || 'thetricks.tips@gmail.com',
  password: argv.email_password || 'Thangdien1@',
}

export const DISQUS = {
  // https://disqus.com/api/applications/<app_id> & Keep permissions: <Read, Write, Manage Forums>
  adminAccessToken: (argv.disqus_admin_access_token as string) || 'disqus admin access_token',
  adminUsername: (argv.disqus_admin_username as string) || 'disqus admin username',
  forum: (argv.disqus_forum_shortname as string) || 'disqus forum shortname',
  // https://disqus.com/api/applications/
  publicKey: (argv.disqus_public_key as string) || 'disqus application public_key',
  secretKey: (argv.disqus_secret_key as string) || 'disqus application secret_key',
}

export const AKISMET = {
  key: argv.akismet_key || 'your akismet Key',
  blog: argv.akismet_blog || 'your akismet blog site, e.g. thetricks.tips',
}

// https://ziyuan.baidu.com/linksubmit/index
export const BAIDU_INDEXED = {
  site: argv.baidu_site || 'your baidu site domain. e.g. thetricks.tips',
  token: argv.baidu_token || 'your baidu seo push token',
}

export const GOOGLE = {
  serverAccountFilePath: path.resolve(ROOT_PATH, 'classified', 'google_service_account.json'),
}

export const ALIYUN_CLOUD_STORAGE = {
  accessKey: (argv.cs_access_key as string) || 'cloudstorage access key for cloud storage',
  secretKey: (argv.cs_secret_key as string) || 'cloudstorage secret key for cloud storage',
  aliyunAcsARN: (argv.cs_aliyun_acs as string) || 'aliyun Acs ARN, e.g. acs:ram::xxx:role/xxx',
}

export const DB_BACKUP = {
  bucket: (argv.db_backup_bucket as string) || 'cloudstorage bucket name for dbbackup',
  region: (argv.db_backup_region as string) || 'cloudstorage region for dbbackup, e.g. oss-cn-hangzhou',
}