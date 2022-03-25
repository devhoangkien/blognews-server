/**
 * @file Cache config service
 * @module processor/cache/config.service
 */

import lodash from 'lodash'
import { CacheOptionsFactory, Injectable } from '@nestjs/common'
import { EmailService } from '@app/common/helper/helper.service.email'
import redisStore, { RedisStoreOptions, CacheStoreOptions } from './cache.store'
import * as APP_CONFIG from '@app/app.config'
import { Logger } from '@nestjs/common'

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly emailService: EmailService) { }

  //Send alert emails (half-minute throttling)
  private sendAlarmMail = lodash.throttle((error: string) => {
    this.emailService.sendMailAs(APP_CONFIG.APP.NAME, {
      to: APP_CONFIG.APP.ADMIN_EMAIL,
      subject: `Redis Error!`,
      text: error,
      html: `<pre><code>${error}</code></pre>`,
    })
  }, 1000 * 30)

  // retry strategy
  public retryStrategy(retries: number): number | Error {
    // https://github.com/redis/node-redis/blob/master/docs/client-configuration.md#reconnect-strategy
    const errorMessage = ['[Redis]', `retryStrategy！retries: ${retries}`]
    Logger.error(...(errorMessage as [any]))
    this.sendAlarmMail(errorMessage.join(''))

    if (retries > 6) {
      return new Error('[Redis] The number of attempts has reached the limit!')
    }

    return Math.min(retries * 1000, 3000)
  }

  // cache configuration
  public createCacheOptions(): CacheStoreOptions {
    // https://github.com/redis/node-redis/blob/master/docs/client-configuration.md
    const redisOptions: RedisStoreOptions = {
      socket: {
        host: APP_CONFIG.REDIS.host as string,
        port: APP_CONFIG.REDIS.port as number,
        reconnectStrategy: this.retryStrategy.bind(this),
      },
    }
    if (APP_CONFIG.REDIS.username) {
      redisOptions.username = APP_CONFIG.REDIS.username
    }
    if (APP_CONFIG.REDIS.password) {
      redisOptions.password = APP_CONFIG.REDIS.password
    }
    return {
      isGlobal: true,
      store: redisStore,
      redisOptions,
    }
  }
}