import { IJson } from './types'

export function qs(query: IJson | undefined): string {
  if (!query) return ''

  const result: string[] = []
  for (const [k, v] of Object.entries(query)) {
    if (v && v !== null && v !== '') {
      result.push(`${k}=${v}`)
    }
  }

  return result.join('&')
}
