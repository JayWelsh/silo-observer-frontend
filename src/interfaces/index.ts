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
    protocol_version: number
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

export interface IPieGroupedData {
    name: string;
    value: number;
    labelFormatFn?: (arg0: any) => string;
    tooltipFormatFn?: (arg0: any) => string;
}

export interface IPieData {
    name: string;
    tooltipText?: string;
    value: number;
    fill?: string;
    labelFormatFn?: (arg0: any) => string;
    tooltipFormatFn?: (arg0: any) => string;
    markForRemoval?: boolean;
    groupedData?: IPieGroupedData[];
    groupedDataTooltipTitle?: string;
    groupedTooltipFontSize?: string;
}
export interface IVolumeResponseEntry {
    usd: string;
    day_timestamp_unix: number;
}

export interface IContractEvent {
    user_address: string;
    amount: string;
    tx_hash: string;
    block_number: number;
    receiver_address: string;
    silo: ISilo;
    asset: IAsset;
    block_hash: string;
    block_timestamp: string;
    network: string;
    block_day_timestamp: string;
}

export interface INetworkGroupedNumber {
    [network: string]: number;
}

export interface IGainAndLossGroupedNumber {
    [gainOrLoss: string]: number;
}

export interface ISiloRevenueUnclaimedFessDailyDeltaByNetworkResponse {
    network: string;
    pending_usd_delta: string;
    harvested_usd_delta: string;
}

export interface IStackedTimeseries {
    date: string;
    [key: string]: number | string;
}