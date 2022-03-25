/**
 * @file 400 Validation error
 * @module error/validation
 */

import { HttpException, HttpStatus } from '@nestjs/common'
import * as TEXT from '@app/common/constants/text.constant'

/**
 * @class ValidationError
 * @classdesc 400 -> There is a problem with the request, this error often occurs in the inner layer of the error, so the code is meaningless
 * @example new ValidationError('error message')
 * @example new ValidationError(new Error())
 */
export class ValidationError extends HttpException {
  constructor(error?: any) {
    super(error || TEXT.VALIDATION_ERROR_DEFAULT, HttpStatus.BAD_REQUEST)
  }
}