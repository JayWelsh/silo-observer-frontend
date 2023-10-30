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
    network: string
    deployment_id: string
    input_token_address: string
    tvl: number
    borrowed: number
    latest_rates: IRate[]
}

export interface ISiloTokenDataResponse {
    data: ISiloTokenDataResponseData
}

export interface ISiloTokenDataResponseData {
    address: string
    network_name: string
    symbol: string
    standard: string
    decimals: string
    name: string
    last_price_usd: string
    is_base_asset: boolean
    market_cap_usd: string
    volume_24hr_usd: string
    change_24hr_usd_percent: string
    coingecko_id: string
}

interface IPieGroupedData {
    name: string;
    value: number;
}

export interface IPieData {
    name: string;
    value: number;
    fill?: string;
    markForRemoval?: boolean;
    groupedData?: IPieGroupedData[];
}