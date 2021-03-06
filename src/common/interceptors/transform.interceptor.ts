/**
 * @file Response data transform interceptor
 * @module interceptor/transform
 */

import { Request } from 'express'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common'
import { HttpResponseSuccess, ResponseStatus } from '@app/common/interfaces/response.interface'
import { getResponsorOptions } from '@app/common/decorators/responsor.decorator'
import * as TEXT from '@app/common/constants/text.constant'

/**
 * @class TransformInterceptor
 * @classdesc When the controller's desired Promise service responds successfully, it will be converted to the standard data structure HttpResponseSuccess<T> here
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, T | HttpResponseSuccess<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T | HttpResponseSuccess<T>> {
    const call$ = next.handle()
    const target = context.getHandler()
    const { successMessage, transform, paginate } = getResponsorOptions(target)
    if (!transform) {
      return call$
    }

    const request = context.switchToHttp().getRequest<Request>()
    return call$.pipe(
      map((data: any) => {
        return {
          status: ResponseStatus.Success,
          message: successMessage || TEXT.HTTP_DEFAULT_SUCCESS_TEXT,
          params: {
            //  isAuthenticated: request.isAuthenticated(),
            //  isUnauthenticated: request.isUnauthenticated(),
            url: request.url,
            method: request.method,
            routes: request.params,
            //  payload: request.$validatedPayload || {},
          },
          result: paginate
            ? {
              data: data.documents,
              pagination: {
                total: data.total,
                current_page: data.page,
                per_page: data.perPage,
                total_page: data.totalPage,
              },
            }
            : data,
        }
      })
    )
  }
}