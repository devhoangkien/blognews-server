/**
 * @file App module
 * @module app/module
 */

import { APP_INTERCEPTOR, APP_GUARD, APP_PIPE } from '@nestjs/core'
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AppController } from '@app/app.controller'

// framework
import { HttpCacheInterceptor } from '@app/common/interceptors/cache.interceptor'
import { ValidationPipe } from '@app/common/pipes/validation.pipe'

// middlewares
import { CorsMiddleware } from '@app/middlewares/cors.middleware'
import { OriginMiddleware } from '@app/middlewares/origin.middleware'

// universal modules
import { DatabaseModule } from '@app/common/database/database.module'
import { CacheModule } from '@app/common/cache/cache.module'
import { HelperModule } from '@app/common/helper/helper.module'


import { TagModule } from '@app/modules/tag/tag.module'
import { UserModule } from '@app/modules/user/user.module'

@Module({
  imports: [
    // https://github.com/nestjs/throttler#readme
    ThrottlerModule.forRoot({
      ttl: 60 * 5, // 5 minutes
      limit: 300, // 300 limit
      ignoreUserAgents: [/googlebot/gi, /bingbot/gi, /baidubot/gi],
    }),
    HelperModule,
    DatabaseModule,
    CacheModule,
    // BIZs
    TagModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, OriginMiddleware).forRoutes('*')
  }
}