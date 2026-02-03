import { Assets, Sprite, Texture, TextureStyle } from 'pixi.js';
import type { ReelSymbol } from './types.ts';

const resolve = (path: string) => {
    const base = import.meta.env.BASE_URL;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    return `${base}${cleanPath}`;
};

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
                    src: resolve('assets/symbols.json'), // Fixes the JSON path
                },
                { alias: 'FRAME', src: resolve(ASSETS.FRAME) },
                { alias: 'BACKGROUND', src: resolve(ASSETS.BACKGROUND) },
                { alias: 'DIVIDER', src: resolve(ASSETS.DIVIDER) },
            ],
        },
    ],
};

export class AssetLoader {
    private static textureCache = new Map<string, Texture>();

    static async init(): Promise<void> {
        TextureStyle.defaultOptions.scaleMode = 'linear';
        Assets.setPreferences({ preferWorkers: true });
        await Assets.init({ manifest });
        await Assets.loadBundle('game-screen');
    }

    static getSymbolTexture(name: string): Texture {
        if (this.textureCache.has(name)) {
            return this.textureCache.get(name)!;
        }

        const texture = Assets.get(name);

        if (texture.source.style) {
            texture.source.style.mipmap = 'on';
        }

        this.textureCache.set(name, texture);

        return texture;
    }

    public static getSprite(alias: string): Sprite {
        return Sprite.from(alias);
    }
}
