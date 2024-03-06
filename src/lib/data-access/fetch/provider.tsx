'use client'

import { PropsWithChildren, useMemo } from 'react'

import NetworkConfig from './context'
import { INetworkProvider } from './types'

export default function NetworkProvider(
  { baseUrl, children }: PropsWithChildren<Partial<INetworkProvider>>
): JSX.Element {
  const context = useMemo(() => ({ baseUrl: baseUrl ?? undefined }), [baseUrl])

  return (
    <NetworkConfig.Provider value={context}>
      {children}
    </NetworkConfig.Provider>
  )
}
