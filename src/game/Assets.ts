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
    APP_BACKGROUND: 'assets/app_background.jpg',
};

const manifest = {
    bundles: [
        {
            name: 'game-screen',
            assets: [
                {
                    alias: 'symbols',
                    src: resolve('assets/symbols.json'),
                },
                { alias: 'FRAME', src: resolve(ASSETS.FRAME) },
                { alias: 'BACKGROUND', src: resolve(ASSETS.BACKGROUND) },
                { alias: 'DIVIDER', src: resolve(ASSETS.DIVIDER) },
                { alias: 'APP_BACKGROUND', src: resolve(ASSETS.APP_BACKGROUND) },
            ],
        },
    ],
};

export class AssetLoader {
    static async init(): Promise<void> {
        TextureStyle.defaultOptions.scaleMode = 'linear';

        await Assets.init({ manifest });

        const resources = await Assets.loadBundle('game-screen');

        for (const alias in resources) {
            const resource = resources[alias];
            if (resource instanceof Texture) {
                resource.source.style.mipmap = 'pow2';
                resource.source.update();
            }
        }
    }

    static getTexture(name: string): Texture {
        return Assets.get(name);
    }

    public static getSprite(alias: string): Sprite {
        return Sprite.from(alias);
    }
}
