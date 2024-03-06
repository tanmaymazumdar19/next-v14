'use client'

import { createContext } from 'react'

import type { INetworkProvider } from './types'

const NetworkConfig = createContext<Partial<INetworkProvider>>({
  baseUrl: undefined,
})

export default NetworkConfig
