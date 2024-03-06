'use client'

import { useContext } from 'react'

import { IAuth, IMutate, IMutateResult, IResponse } from './types'
import NetworkConfig from './context'
import baseFetch from './base-fetch'
import { qs } from './query-string'
import cacheMap from './cache'

export function useMutate<Data extends IResponse, Error extends IResponse>(
  key: string,
  opts: Partial<IMutate<Data, Error>> = {}
): IMutateResult<Data, Error> {
  const context = useContext(NetworkConfig)

  const url = `${context.baseUrl}${key}${qs(opts.queryParams)}`
  const fetchConfig = {
    method: opts.method ?? 'POST',
    headers: {
      ...context.headers,
      ...(opts?.auth?.accessToken
        ? { AuthenticationToken: opts.auth.accessToken }
        : {}),
    },
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async function mutate(
    body: BodyInit
  ): Promise<{ data: Data | undefined; error: Error | undefined }> {
    let data: Data | undefined
    let error: Error | undefined

    const requestPayload = { ...fetchConfig, body }

    let responsePayload = JSON.parse(
      cacheMap.get({ url, requestPayload }) ?? '0'
    )

    if (responsePayload) {
      opts.onSuccess?.(responsePayload)
      return responsePayload
    } else {
      let res: Data | Error
      try {
        res = await baseFetch<Data | Error>(url, requestPayload)

        if (context.unauthCode && context.unauthCode === res.statusCode) {
          const auth: IAuth | undefined = await context.onAuthFailed?.()
          res = await baseFetch(url, {
            ...requestPayload,
            headers: {
              ...requestPayload.headers,
              ...(auth?.accessToken
                ? { AuthenticationToken: auth.accessToken }
                : {}
              ),
            },
          })
        }

        if (context.errors && context.errors?.[res.statusCode]) {
          error = res as Error
        } else {
          data = res as Data

          if (opts.invalidateTag) {
            cacheMap.delete(opts.invalidateTag)
          }
        }

        responsePayload = { data, error }
        cacheMap.set({ url, requestPayload }, JSON.stringify(responsePayload))
        opts.onSuccess?.(responsePayload)

        return { data, error }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error_: any) {
        error = error_
        data = undefined

        return { data, error }
      }
    }
  }

  return { mutate }
}
