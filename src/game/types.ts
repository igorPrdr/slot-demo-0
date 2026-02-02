export type ReelSymbol =
    | 'APPLE'
    | 'BLUEBERRY'
    | 'COIN'
    | 'CROWN'
    | 'FIG'
    | 'GOLD'
    | 'GRAPE'
    | 'LEMON'
    | 'PEACH'
    | 'PLUMP'
    | 'STRAWBERRY';

export interface WinLine {
    id: string;
    color: number;
    path: number[][];
    multiplier?: number;
}

export interface SpinResult {
    grid: ReelSymbol[][];
    stops: number[];
    winAmount: number;
    winLines: WinLine[];
}
