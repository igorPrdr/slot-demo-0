import { WIN_LINES, PAYTABLE, REEL_STRIPS } from './Config';
import type { ReelSymbol, WinLine } from './types.ts';

export class MockBackend {
    private static PROBABILITY_TABLE = [
        { type: 'LOSS', weight: 70 },
        { type: 'SMALL', weight: 20 },
        { type: 'MEDIUM', weight: 7 },
        { type: 'BIG', weight: 3 },
    ];

    private static SYMBOL_GROUPS: Record<string, string[]> = {
        TIER_1: ['CROWN'],
        TIER_2: ['GOLD'],
        TIER_3: ['COIN'],
        TIER_4: ['APPLE', 'BLUEBERRY', 'FIG', 'GRAPE', 'LEMON', 'PEACH', 'PLUMP', 'STRAWBERRY'],
    };

    static async spin(
        bet: number,
        forceWin: boolean = false,
    ): Promise<{
        grid: string[][];
        stops: number[];
        winAmount: number;
        winLines: WinLine[];
    }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const outcome = this.determineOutcome(forceWin);
                let result;

                if (outcome === 'LOSS') {
                    result = this.generateLoss(bet);
                } else {
                    result = this.generateWin(outcome, bet);
                }

                resolve(result);
            }, 150);
        });
    }

    private static determineOutcome(forceWin: boolean): string {
        if (forceWin) {
            console.log('🐞 DEBUG: Forcing Win via Toggle');
            const debugTiers = ['SMALL', 'SMALL', 'MEDIUM', 'BIG'];
            return debugTiers[Math.floor(Math.random() * debugTiers.length)];
        }

        const totalWeight = this.PROBABILITY_TABLE.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.floor(Math.random() * totalWeight);

        for (const item of this.PROBABILITY_TABLE) {
            if (random < item.weight) return item.type;
            random -= item.weight;
        }
        return 'LOSS';
    }

    private static generateLoss(bet: number) {
        let isValidLoss = false;
        let stops: number[] = [0, 0, 0];
        let grid: ReelSymbol[][] = [];
        let attempts = 0;

        while (!isValidLoss && attempts < 100) {
            attempts++;
            stops = [
                Math.floor(Math.random() * REEL_STRIPS[0].length),
                Math.floor(Math.random() * REEL_STRIPS[1].length),
                Math.floor(Math.random() * REEL_STRIPS[2].length),
            ];
            grid = this.buildGridFromStops(stops);
            const wins = this.calculateAllWins(grid, bet);
            if (wins.totalWin === 0) isValidLoss = true;
        }

        return { grid, stops, winAmount: 0, winLines: [] };
    }

    private static generateWin(type: string, bet: number) {
        const target = this.selectWinTarget(type);
        const validLine = target.line;
        const validSymbol = target.symbol;

        const r0Stops = this.findStopsForSymbol(0, validSymbol, validLine.path[0][1]);
        const r1Stops = this.findStopsForSymbol(1, validSymbol, validLine.path[1][1]);
        const r2Stops = this.findStopsForSymbol(2, validSymbol, validLine.path[2][1]);

        if (r0Stops.length === 0 || r1Stops.length === 0 || r2Stops.length === 0) {
            console.warn(`Impossible combo: ${validSymbol} on Line ${validLine.id}`);
            return this.generateLoss(bet);
        }

        const stops = [
            this.pickRandom(r0Stops),
            this.pickRandom(r1Stops),
            this.pickRandom(r2Stops),
        ];

        const grid = this.buildGridFromStops(stops);
        const winData = this.calculateAllWins(grid, bet);

        return {
            grid,
            stops,
            winAmount: winData.totalWin,
            winLines: winData.lines,
        };
    }

    private static calculateAllWins(grid: ReelSymbol[][], bet: number) {
        let totalWin = 0;
        const winningLines: WinLine[] = [];

        WIN_LINES.forEach((line) => {
            const s1 = grid[0][line.path[0][1]];
            const s2 = grid[1][line.path[1][1]];
            const s3 = grid[2][line.path[2][1]];

            if (s1 === s2 && s2 === s3) {
                const symbolVal = PAYTABLE[s1] || 0;
                const win = bet * symbolVal * (line.multiplier || 1);

                if (win > 0) {
                    totalWin += win;
                    winningLines.push({
                        id: line.id,
                        color: line.color,
                        path: line.path,
                    });
                }
            }
        });
        return { totalWin, lines: winningLines };
    }

    private static selectWinTarget(type: string) {
        let symbolPool: string[] = [];
        switch (type) {
            case 'BIG':
                symbolPool = this.SYMBOL_GROUPS.TIER_1;
                break;
            case 'MEDIUM':
                symbolPool = [...this.SYMBOL_GROUPS.TIER_2, ...this.SYMBOL_GROUPS.TIER_3];
                break;
            case 'SMALL':
            default:
                symbolPool = this.SYMBOL_GROUPS.TIER_4;
                break;
        }
        const selectedSymbol = this.pickRandom(symbolPool);
        const selectedLine = this.pickRandom(WIN_LINES);
        return { line: selectedLine, symbol: selectedSymbol };
    }

    private static buildGridFromStops(stops: number[]): ReelSymbol[][] {
        return stops.map((stopIndex, reelId) => {
            const strip = REEL_STRIPS[reelId];
            const col: ReelSymbol[] = [];
            for (let i = 0; i < 3; i++) {
                const symbolIndex = (stopIndex + i) % strip.length;
                col.push(strip[symbolIndex]);
            }
            return col;
        });
    }

    private static findStopsForSymbol(reelId: number, symbol: string, row: number): number[] {
        const strip = REEL_STRIPS[reelId];
        const validStops: number[] = [];
        for (let i = 0; i < strip.length; i++) {
            const indexToCheck = (i + row) % strip.length;
            if (strip[indexToCheck] === symbol) validStops.push(i);
        }
        return validStops;
    }

    private static pickRandom<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
