export interface IAsset {
    address: string
    symbol: string
    decimals: number
}

export interface IRate {
    id: number
    rate: number
    side: string
    timestamp: string
    silo_address?: string
    asset_address?: string
    type: string
    silo?: ISilo
    asset?: IAsset
}

export interface ISilo {
    name: string
    address: string
    input_token_address: string
    tvl: number
    borrowed: number
    latest_rates: IRate[]
}