/**
 * @file Helper Email service
 * @module helper/email.service
 */

import nodemailer from 'nodemailer'
import { Injectable } from '@nestjs/common'
import { getMessageFromNormalError } from '@app/common/transformers/error.transformer'
import * as APP_CONFIG from '@app/app.config'
import { Logger } from '@nestjs/common'

export interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

@Injectable()
export class EmailService {
  private transporter: nodemailer
  private clientIsValid: boolean

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: APP_CONFIG.EMAIL.host,
      secure: true,
      port: 465,
      auth: {
        user: APP_CONFIG.EMAIL.account,
        pass: APP_CONFIG.EMAIL.password,
      },
    })
    this.verifyClient()
  }

  private verifyClient(): void {
    return this.transporter.verify((error) => {
      if (error) {
        this.clientIsValid = false
        setTimeout(this.verifyClient.bind(this), 1000 * 60 * 30)
        Logger.error(`[NodeMailer]`, `client init failed! retry when after 30 mins`, getMessageFromNormalError(error))
      } else {
        this.clientIsValid = true
        Logger.log('[NodeMailer]', 'client init succeed!')
      }
    })
  }

  public sendMail(mailOptions: EmailOptions) {
    if (!this.clientIsValid) {
      Logger.warn('[NodeMailer]', 'send failed! reason: init failed')
      return false
    }
    const options = {
      ...mailOptions,
      from: `"${APP_CONFIG.APP.MASTER}" <${APP_CONFIG.EMAIL.account}>`,
    }
    this.transporter.sendMail(options, (error, info) => {
      if (error) {
        Logger.error(`[NodeMailer]`, `send failed! reason:`, getMessageFromNormalError(error))
      } else {
        Logger.log('[NodeMailer]', 'send succeed!', info.messageId, info.response)
      }
    })
  }

  public sendMailAs(prefix: string, mailOptions: EmailOptions) {
    return this.sendMail({
      ...mailOptions,
      subject: `[${prefix}] ${mailOptions.subject}`,
    })
  }
}