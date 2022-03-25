/**
 * @file General helper module
 * @module helper/module
 */

import { Module, Global } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { GoogleService } from './helper.service.google'
// import { CloudStorageService } from './helper.service.cloud-storage'
import { EmailService } from './helper.service.email'
import { SeoService } from './helper.service.seo'
import { IPService } from './helper.service.ip'

const services = [EmailService, SeoService, GoogleService, IPService]

@Global()
@Module({
  imports: [HttpModule],
  providers: services,
  exports: services,
})
export class HelperModule { }