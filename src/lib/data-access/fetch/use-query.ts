'use client'

import { useContext, useEffect, useState } from 'react'

import { IAuth, IQuery, IQueryResult, IResponse } from './types'
import NetworkConfig from './context'
import { qs } from './query-string'
import baseFetch from './base-fetch'
import cacheMap from './cache'

export function useQuery<Data extends IResponse, Error extends IResponse>(
  key: string,
  opts: Partial<IQuery<Data, Error>> = {}
): IQueryResult<Data, Error> {
  const context = useContext(NetworkConfig)

  const [data, setData] = useState<Data>()
  const [error, setError] = useState<Error>()
  const [isError, setIsError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const url = `${context.baseUrl}${key}${qs(opts?.queryParams)}`
  const fetchConfig = {
    method: 'GET',
    headers: {
      ...context.headers,
      ...(opts?.auth?.accessToken
        ? { AuthenticationToken: opts.auth.accessToken }
        : {}
      ),
    },
  }

  function responseHandler(res: Data | Error, cache: boolean = true): void {
    if (context.errors && context.errors?.[res.statusCode]) {
      setError(res as Error)
      setData(undefined)
      setIsLoading(false)
    } else {
      setData(res as Data)
      setIsLoading(false)
    }

    if (cache) {
      cacheMap.set({ url, fetchConfig }, JSON.stringify(res))
    }
  }

  async function runFetch(): Promise<void> {
    let res: Data | Error
    try {
      res = await baseFetch<Data>(url, fetchConfig)

      if (context.unauthCode && context.unauthCode === res.statusCode) {
        const auth: IAuth | undefined = await context.onAuthFailed?.()
        res = await baseFetch(url, {
          ...fetchConfig,
          headers: {
            ...fetchConfig.headers,
            ...(auth?.accessToken
              ? { AuthenticationToken: auth.accessToken }
              : {}
            ),
          },
        })
        responseHandler(res)
      } else {
        responseHandler(res)
      }
    } catch (error_) {
      setIsError(true)
      setIsLoading(false)
      setData(undefined)
      setError(error_ as Error)
    }
  }

  async function refetch(): Promise<void> {
    setIsLoading(true)
    setIsError(false)
    setData(undefined)
    await runFetch()
  }

  function run(): void {
    const res: Data | Error = JSON.parse(cacheMap.get({ url, fetchConfig }) ?? '0')
    if (res) {
      responseHandler(res, false)
    } else if (key !== '' && key !== null && key !== undefined) {
      refetch()
    }
  }

  // useEffect(run, []) // maybe we don't need this
  useEffect(run, [key, opts?.queryParams])

  return { data, error, isError, isLoading, refetch }
}
