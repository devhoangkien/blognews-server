/**
 * @file main.ts
 * @module app/main
 * @author Devhoangkien <https://github.com/devhoangkien>
 */

 import helmet from 'helmet'
 import passport from 'passport'
 import bodyParser from 'body-parser'
 import cookieParser from 'cookie-parser'
 import compression from 'compression'
 import { NestFactory } from '@nestjs/core'
 import { AppModule } from '@app/app.module'
 import { HttpExceptionFilter } from '@app/filters/error.filter'
 import { TransformInterceptor } from '@app/interceptors/transform.interceptor'
 import { ErrorInterceptor } from '@app/interceptors/error.interceptor'
 import { environment, isProdEnv } from '@app/app.environment'
 import * as APP_CONFIG from '@app/app.config'
 import { Logger } from '@nestjs/common';
 import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth'


 
 async function bootstrap() {
   // MARK: keep logger enabled on dev env
   const app = await NestFactory.create(AppModule, isProdEnv ? { logger: false } : {})

   app.use(helmet())
   app.use(compression())
   app.use(cookieParser())
   app.use(bodyParser.json({ limit: '1mb' }))
   app.use(bodyParser.urlencoded({ extended: true }))
   app.use(passport.initialize())
   app.useGlobalFilters(new HttpExceptionFilter())
   app.useGlobalInterceptors(new TransformInterceptor(), new ErrorInterceptor())

   // Swagger
   if (APP_CONFIG.SWAGGER.SWAGGER_IS_SHOW === 'true') {
    app.use(
      [APP_CONFIG.SWAGGER.SWAGGER_PATH],
      expressBasicAuth({
        challenge: true,
        users: {
          [APP_CONFIG.SWAGGER.SWAGGER_USER]: APP_CONFIG.SWAGGER.SWAGGER_PASSWORD,
        },
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('TheTricks API')
      .setDescription('The API documentation of TheTricks.Tips')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'TheTricks API',
    };
    SwaggerModule.setup('swagger', app, document, customOptions);
  }

  // App listen
   return await app.listen(APP_CONFIG.APP.PORT)
 }
 
 const logger = new Logger('Bootstrap');
 bootstrap().then(async() => {
  await logger.log(`NodePress Run! port at ${APP_CONFIG.APP.PORT}, env: ${environment}`)
 })