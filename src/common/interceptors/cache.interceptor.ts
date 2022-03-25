/**
 * @file HttpCache interceptor
 * @module interceptor/cache
 */

import { tap } from 'rxjs/operators'
import { Observable, of } from 'rxjs'
import {
  HttpAdapterHost,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Injectable,
  RequestMethod,
} from '@nestjs/common'
import { getHttpCacheKey, getHttpCacheTTL } from '@app/common/decorators/cache.decorator'
import { CacheService } from '@app/common/cache/cache.service'
import * as SYSTEM from '@app/common/constants/system.constant'
import * as APP_CONFIG from '@app/app.config'

/**
 * @class HttpCacheInterceptor
 * @classdescMake up for the defects that the framework does not support defining ttl parameters separately and single-request applications
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(SYSTEM.HTTP_ADAPTER_HOST)
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly cacheService: CacheService
  ) { }

  // Custom decorator, modifying the ttl parameter
  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    //If you want to completely disable the cache service, return directly -> return call$;
    const call$ = next.handle()
    const key = this.trackBy(context)

    if (!key) {
      return call$
    }

    const target = context.getHandler()
    const metaTTL = getHttpCacheTTL(target)
    const ttl = metaTTL || APP_CONFIG.APP.DEFAULT_CACHE_TTL

    try {
      const value = await this.cacheService.get(key)
      return value ? of(value) : call$.pipe(tap((response) => this.cacheService.set(key, response, { ttl })))
    } catch (error) {
      return call$
    }
  }

  /**
   * @function trackBy
   * @description The current hit rule is: CacheKey must be manually set to enable the cache mechanism, and the default ttl is APP_CONFIG.REDIS.defaultCacheTTL
   */
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest()
    const httpServer = this.httpAdapterHost.httpAdapter
    const isHttpApp = Boolean(httpServer?.getRequestMethod)
    const isGetRequest = isHttpApp && httpServer.getRequestMethod(request) === RequestMethod[RequestMethod.GET]
    const cacheKey = getHttpCacheKey(context.getHandler())
    const isMatchedCache = isHttpApp && isGetRequest && cacheKey
    return isMatchedCache ? cacheKey : undefined

  }
}