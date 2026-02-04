import { Container, Graphics } from 'pixi.js';
import { ReelContainer } from './ReelContainer.ts';
import { AssetLoader } from './Assets.ts';
import { SLOT_CONFIG } from './Config.ts';
import { PaylinesContainer } from './PaylinesContainer.ts';
import type { WinLine } from './types.ts';

export class SlotMachineContainer extends Container {
    private _reels: ReelContainer[] = [];
    private _paylines: PaylinesContainer;

    constructor() {
        super();

        const reelContainer = new Container();

        const bg = AssetLoader.getSprite('BACKGROUND');
        bg.anchor.set(0.5);
        bg.x = SLOT_CONFIG.CENTER_X;
        bg.y = SLOT_CONFIG.CENTER_Y;
        reelContainer.addChild(bg);

        for (let i = 1; i < SLOT_CONFIG.REEL_COUNT; i++) {
            const xPos = i * (SLOT_CONFIG.SYMBOL_WIDTH + SLOT_CONFIG.REEL_GAP);
            const divider = AssetLoader.getSprite('DIVIDER');
            divider.anchor.set(0.5);
            divider.scale.set(1 / 1.2);
            divider.x = xPos - SLOT_CONFIG.REEL_GAP / 2;
            divider.y = SLOT_CONFIG.CENTER_Y;
            reelContainer.addChild(divider);
        }

        this._paylines = new PaylinesContainer();
        reelContainer.addChild(this._paylines);

        for (let i = 0; i < SLOT_CONFIG.REEL_COUNT; i++) {
            const xPos = i * (SLOT_CONFIG.SYMBOL_WIDTH + SLOT_CONFIG.REEL_GAP);
            const reel = new ReelContainer(i, xPos);
            reelContainer.addChild(reel);
            this._reels.push(reel);
        }

        const mask = new Graphics()
            .rect(0, 0, SLOT_CONFIG.MACHINE_WIDTH, SLOT_CONFIG.MACHINE_HEIGHT)
            .fill(0xff0000);
        reelContainer.addChild(mask);
        reelContainer.mask = mask;
        this.addChild(reelContainer);

        const frame = AssetLoader.getSprite('FRAME');
        frame.scale.set(0.83, 0.75);
        frame.anchor.set(0.5);
        frame.x = SLOT_CONFIG.CENTER_X - 3;
        frame.y = SLOT_CONFIG.CENTER_Y + 2;
        this.addChild(frame);

        this.pivot.set(SLOT_CONFIG.CENTER_X, SLOT_CONFIG.CENTER_Y);
    }

    public spin() {
        this._paylines.clear();

        this._reels.forEach((reel, index) => {
            reel.resetSymbols();
            setTimeout(() => {
                reel.spin();
            }, index * 20);
        });
    }

    public async stop(stops: number[]): Promise<void> {
        const promises: Promise<void>[] = [];
        let accumulatedDelay = 0;

        this._reels.forEach((reel, index) => {
            if (index === 0) {
                accumulatedDelay = Math.random() * 800;
            } else {
                const suspense = Math.random() * 1200 * index;
                accumulatedDelay += 400 + suspense;
            }

            const p = new Promise<void>((resolve) => {
                setTimeout(async () => {
                    await reel.stop(stops[index]);
                    resolve();
                }, accumulatedDelay);
            });
            promises.push(p);
        });

        await Promise.all(promises);
    }

    public highlightWins(winLines: WinLine[]) {
        this._reels.forEach((r) => r.resetSymbols());

        winLines.forEach((line) => {
            const path = line.path;
            path.forEach((coord: number[]) => {
                const reelIndex = coord[0];
                const rowIndex = coord[1];
                this._reels[reelIndex].highlightSymbol(rowIndex);
            });
        });

        this._paylines.drawWinLines(winLines);
    }

    public update(delta: number) {
        this._reels.forEach((reel) => reel.update(delta));
    }
}
