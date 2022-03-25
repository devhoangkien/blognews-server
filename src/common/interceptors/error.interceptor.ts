/**
 * @file Error interceptor
 * @module interceptor/error
 */

import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common'
import { getResponsorOptions } from '@app/common/decorators/responsor.decorator'
import { CustomError } from '@app/common/errors/custom.error'
import * as TEXT from '@app/common/constants/text.constant'

/**
 * @class ErrorInterceptor
 * @classdesc catch error when controller Promise rejected
 */
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const call$ = next.handle()
    const target = context.getHandler()
    const { errorCode, errorMessage } = getResponsorOptions(target)
    return call$.pipe(
      catchError((error) => {
        return throwError(
          () => new CustomError({ message: errorMessage || TEXT.HTTP_DEFAULT_ERROR_TEXT, error }, errorCode)
        )
      })
    )
  }
}