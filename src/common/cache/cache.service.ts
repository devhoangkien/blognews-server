/**
 * @file Cache enhancer service
 * @module processor/cache/service
 */

import schedule from 'node-schedule'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { RedisCacheStore } from './cache.store'
import { Logger } from '@nestjs/common'

export type CacheKey = string
export type CacheResult<T> = Promise<T>

// IO Pattern Generic Return Structure
export interface CacheIOResult<T> {
  get(): CacheResult<T>
  update(): CacheResult<T>
}

// Promise Mode parameter
export interface CachePromiseOption<T> {
  key: CacheKey
  promise(): CacheResult<T>
}

// Promise & IO Mode parameter
export interface CachePromiseIOOption<T> extends CachePromiseOption<T> {
  ioMode?: boolean
}

// Interval & Timeout timeout mode parameter (milliseconds)
export interface CacheIntervalTimeoutOption {
  error?: number
  success?: number
}

// Interval & Timing Timing Mode Parameters (milliseconds)
export interface CacheIntervalTimingOption {
  error: number
  schedule: any
}

// Interval Mode parameter
export interface CacheIntervalOption<T> {
  key: CacheKey
  promise(): CacheResult<T>
  timeout?: CacheIntervalTimeoutOption
  timing?: CacheIntervalTimingOption
}

// Interval Schema return type
export type CacheIntervalResult<T> = () => CacheResult<T>

// Interval & IO Mode parameter
export interface CacheIntervalIOOption<T> extends CacheIntervalOption<T> {
  ioMode?: boolean
}

/**
 * @class CacheService
 * @classdesc Host the cache service
 * @example CacheService.get(CacheKey).then()
 * @example CacheService.set(CacheKey).then()
 * @example CacheService.promise({ option })()
 * @example CacheService.interval({ option })()
 */
@Injectable()
export class CacheService {
  private cacheStore!: RedisCacheStore
  private isReadied = false

  constructor(@Inject(CACHE_MANAGER) cacheManager: Cache) {
    // https://github.com/redis/node-redis#events
    this.cacheStore = cacheManager.store as RedisCacheStore
    this.cacheStore.client.on('connect', () => {
      Logger.log('[Redis]', 'connecting...')
    })
    this.cacheStore.client.on('reconnecting', () => {
      Logger.warn('[Redis]', 'reconnecting...')
    })
    this.cacheStore.client.on('ready', () => {
      this.isReadied = true
      Logger.log('[Redis]', 'readied!')
    })
    this.cacheStore.client.on('end', () => {
      this.isReadied = false
      Logger.error('[Redis]', 'Client End!')
    })
    this.cacheStore.client.on('error', (error) => {
      this.isReadied = false
      Logger.error('[Redis]', `Client Error!`, error.message)
    })
    // connect
    this.cacheStore.client.connect()
  }

  public get<T>(key: CacheKey): CacheResult<T> {
    if (!this.isReadied) {
      return Promise.reject('Redis has not ready!')
    }
    return this.cacheStore.get(key)
  }

  public delete(key: CacheKey): CacheResult<void> {
    if (!this.isReadied) {
      return Promise.reject('Redis has not ready!')
    }
    return this.cacheStore.del(key)
  }

  public set(
    key: CacheKey,
    value: any,
    options?: {
      /** seconds */
      ttl: number
    }
  ): CacheResult<void> {
    if (!this.isReadied) {
      return Promise.reject('Redis has not ready!')
    }
    return this.cacheStore.set(key, value, options)
  }

  /**
   * @function promise
   * @description Passive Update | Two-Way Sync Mode，Promise -> Redis
   * @example CacheService.promise({ key: CacheKey, promise() }) -> promise()
   * @example CacheService.promise({ key: CacheKey, promise(), ioMode: true }) -> { get: promise(), update: promise() }
   */
  promise<T>(options: CachePromiseOption<T>): CacheResult<T>
  promise<T>(options: CachePromiseIOOption<T>): CacheIOResult<T>
  promise(options) {
    const { key, promise, ioMode = false } = options

    // Packaging tasks
    const doPromiseTask = async () => {
      const data = await promise()
      await this.set(key, data)
      return data
    }

    // Promise Intercept mode (return dead data)
    const handlePromiseMode = async () => {
      const value = await this.get(key)
      return value !== null && value !== undefined ? value : await doPromiseTask()
    }

    // Two-way sync mode (returns getter and updater)
    const handleIoMode = () => ({
      get: handlePromiseMode,
      update: doPromiseTask,
    })

    return ioMode ? handleIoMode() : handlePromiseMode()
  }

  /**
   * @function interval
   * @description Timing | Timeout Mode，Promise -> Task -> Redis
   * @example CacheService.interval({ key: CacheKey, promise(), timeout: {} }) -> promise()
   * @example CacheService.interval({ key: CacheKey, promise(), timing: {} }) -> promise()
   */
  public interval<T>(options: CacheIntervalOption<T>): CacheIntervalResult<T>
  public interval<T>(options: CacheIntervalIOOption<T>): CacheIOResult<T>
  public interval<T>(options) {
    const { key, promise, timeout, timing, ioMode = false } = options

    // Packaging tasks
    const promiseTask = async (): Promise<T> => {
      const data = await promise()
      await this.set(key, data)
      return data
    }

    // timeout task
    if (timeout) {
      const doPromise = () => {
        promiseTask()
          .then(() => {
            setTimeout(doPromise, timeout.success)
          })
          .catch((error) => {
            const time = timeout.error || timeout.success
            setTimeout(doPromise, time)
            Logger.warn('[Redis]', `Timeout task execution failed, ${time / 1000}s retry later`, error)
          })
      }
      doPromise()
    }

    // timed task
    if (timing) {
      const doPromise = () => {
        promiseTask()
          .then((data) => data)
          .catch((error) => {
            Logger.warn('[Redis]', `The execution of the scheduled task failed,${timing.error / 1000}s retry later`, error)
            setTimeout(doPromise, timing.error)
          })
      }
      doPromise()
      schedule.scheduleJob(timing.schedule, doPromise)
    }

    // getter
    const getKeyCache = () => this.get(key)

    // Two-way sync mode (returns getter and updater)
    const handleIoMode = () => ({
      get: getKeyCache,
      update: promiseTask,
    })

    // Returns the Redis getter
    return ioMode ? handleIoMode() : getKeyCache
  }
}