/**
 * @file Database providers > mongoose connection
 * @module processor/database/providers
 * @author Surmon <https://github.com/surmon-china>
 */

import mongoose from 'mongoose'
import { EmailService } from '@app/common/helper/helper.service.email'
import { DB_CONNECTION_TOKEN } from '@app/common/constants/system.constant'
import * as APP_CONFIG from '@app/app.config'
import { Logger } from '@nestjs/common'
export const databaseProvider = {
  inject: [EmailService],
  provide: DB_CONNECTION_TOKEN,
  useFactory: async (emailService: EmailService) => {
    let reconnectionTask: NodeJS.Timeout | null = null
    const RECONNECT_INTERVAL = 6000

    // Send alert emails (when emails are sent, the database has reached a point of no return)
    const sendAlarmMail = (error: string) => {
      emailService.sendMailAs(APP_CONFIG.APP.NAME, {
        to: APP_CONFIG.APP.ADMIN_EMAIL,
        subject: `MongoDB Error!`,
        text: error,
        html: `<pre><code>${error}</code></pre>`,
      })
    }

    const connection = () => {
      return mongoose.connect(APP_CONFIG.MONGO_DB.uri, {})
    }

    mongoose.connection.on('connecting', () => {
      Logger.log('[MongoDB]', 'connecting...')
    })

    mongoose.connection.on('open', () => {
      Logger.log('[MongoDB]', 'Ok - Readied!')
      if (reconnectionTask) {
        clearTimeout(reconnectionTask)
        reconnectionTask = null
      }
    })

    mongoose.connection.on('disconnected', () => {
      Logger.error('[MongoDB]', `disconnected! retry when after ${RECONNECT_INTERVAL / 1000}s`)
      reconnectionTask = setTimeout(connection, RECONNECT_INTERVAL)
    })

    mongoose.connection.on('error', (error) => {
      Logger.error('[MongoDB]', 'error!', error)
      mongoose.disconnect()
      sendAlarmMail(String(error))
    })

    return await connection()
  },
}