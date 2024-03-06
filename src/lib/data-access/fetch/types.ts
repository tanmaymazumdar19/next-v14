export interface IAuth {
  accessToken: string | undefined
  refreshToken: string | undefined
}

export interface INetworkConfig {
  auth: IAuth
  errors: string[]
  headers: HeadersInit
  onAuthFailed: () => Promise<IAuth>
  unauthCode: number
}

export interface INetworkProvider extends Partial<INetworkConfig> {
  baseUrl: string | undefined
}

export interface IJson {
  [key: string]: string | boolean | number
}

export interface IQuery<Data extends IResponse, Error extends IResponse> {
  auth: IAuth | undefined
  notifyOnChangeProps: string[]
  queryParams: IJson
  refetchOnMount: boolean // defaults to true
  retry: number // defaults to 0
  tag: string | string[]
  transformResponse: (res: Data | Error) => Data | Error
}

export interface IQueryResult<Data extends IResponse, Error extends IResponse> {
  data: Data | undefined
  error: Error | undefined
  isError: boolean
  isLoading: boolean
  refetch: () => Promise<void>
}

export interface IResponse {
  status: boolean
  statusCode: number
  message: string
}

export interface IOnSuccess<Data extends IResponse, Error extends IResponse> {
  data: Data | undefined
  error: Error | undefined
}

export interface IMutate<Data extends IResponse, Error extends IResponse> {
  auth: IAuth | undefined
  invalidateTag: string | string[]
  method: string
  onSuccess: (opts: IOnSuccess<Data, Error>) => Promise<void> | void
  queryParams: IJson
  transformResponse: (res: Data | Error) => Data | Error
}

export interface IMutateResult<
  Data extends IResponse,
  Error extends IResponse
> {
  mutate: (body: BodyInit) => Promise<IOnSuccess<Data, Error>>
}
