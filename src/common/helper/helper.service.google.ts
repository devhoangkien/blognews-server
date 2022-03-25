/**
 * Helper Google service.
 * @file Helper Google credentials service
 * @module common/helper/google.service
 */

import { google } from 'googleapis'
import { Credentials, JWT } from 'google-auth-library'
import { Injectable } from '@nestjs/common'
import { getMessageFromNormalError } from '@app/common/transformers/error.transformer'
import { UNDEFINED } from '@app/common/constants/value.constant'
import * as APP_CONFIG from '@app/app.config'
import { Logger } from '@nestjs/common'

@Injectable()
export class GoogleService {
  private jwtClient: JWT | null = null

  constructor() {
    this.initClient()
  }

  private initClient() {
    try {
      const key = require(APP_CONFIG.GOOGLE.serverAccountFilePath)
      this.jwtClient = new google.auth.JWT(
        key.client_email,
        UNDEFINED,
        key.private_key,
        [
          'https://www.googleapis.com/auth/indexing', // ping 服务
          'https://www.googleapis.com/auth/analytics.readonly', // GA 服务
        ],
        UNDEFINED
      )
    } catch (error) {
      Logger.warn('[GoogleAPI]', 'Failed to read configuration file during service initialization!')
    }
  }

  // Get a certificate
  public getCredentials(): Promise<Credentials> {
    return new Promise((resolve, reject) => {
      if (!this.jwtClient) {
        return reject('[GoogleAPI] Failed to initialize successfully, unable to get certificate！')
      }
      this.jwtClient.authorize((error, credentials: Credentials) => {
        const message = getMessageFromNormalError(error)
        if (message) {
          Logger.warn('[GoogleAPI]', 'Failed to get certificate:', message)
          reject(message)
        }
        resolve(credentials)
      })
    })
  }
}