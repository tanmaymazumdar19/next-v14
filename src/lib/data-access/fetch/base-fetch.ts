import { IResponse } from './types'

export default async function baseFetch<Data extends IResponse>(
  url: string,
  init?: RequestInit
): Promise<Data> {
  let response: Data = {} as Data

  try {
    response = await fetch(url, init)
    
    if (response.ok) {
      response = await response.json()
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Failed to fetch: ${error.message}`)
  }

  return response
}
