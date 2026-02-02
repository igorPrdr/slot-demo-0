import { Assets, Sprite, Texture } from 'pixi.js';
import type { ReelSymbol } from './types.ts';

export const SYMBOLS: Record<ReelSymbol, string> = {
    APPLE: 'apple.png',
    BLUEBERRY: 'blueberry.png',
    COIN: 'coin.png',
    CROWN: 'crown.png',
    FIG: 'fig.png',
    GOLD: 'gold.png',
    GRAPE: 'grape.png',
    LEMON: 'lemon.png',
    PEACH: 'peach.png',
    PLUMP: 'plump.png',
    STRAWBERRY: 'strawberry.png',
};

export const ASSETS = {
    FRAME: 'assets/slot_machine_frame.png',
    BACKGROUND: 'assets/slot_machine_background.png',
    DIVIDER: 'assets/reel_divider.png',
};

const manifest = {
    bundles: [
        {
            name: 'game-screen',
            assets: [
                {
                    alias: 'symbols',
                    src: '/assets/symbols.json',
                },
                { alias: 'FRAME', src: ASSETS.FRAME },
                { alias: 'BACKGROUND', src: ASSETS.BACKGROUND },
                { alias: 'DIVIDER', src: ASSETS.DIVIDER },
            ],
        },
    ],
};

export class AssetLoader {
    static async init(): Promise<void> {
        await Assets.init({ manifest });
        await Assets.loadBundle('game-screen');
    }

    static getSymbolTexture(name: string): Texture {
        return Assets.get(name);
    }

    public static getSprite(alias: string): Sprite {
        return Sprite.from(alias);
    }
}
