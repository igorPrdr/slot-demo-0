import { Container, Graphics } from 'pixi.js';
import { SLOT_CONFIG } from './Config';
import gsap from 'gsap';
import type { WinLine } from './types.ts';

export class PaylinesContainer extends Container {
    private COL_WIDTH = SLOT_CONFIG.SYMBOL_WIDTH + SLOT_CONFIG.REEL_GAP;
    private ROW_HEIGHT = SLOT_CONFIG.SYMBOL_HEIGHT;
    private HALF_WIDTH = SLOT_CONFIG.SYMBOL_WIDTH / 2;
    private HALF_HEIGHT = SLOT_CONFIG.SYMBOL_HEIGHT / 2;

    constructor() {
        super();
        this.eventMode = 'none';
    }

    public drawWinLines(lines: WinLine[]) {
        this.clear();

        lines.forEach((line, index) => {
            const lineContainer = new Container();
            this.addChild(lineContainer);

            const g = new Graphics();
            const path = line.path;

            const startX = path[0][0] * this.COL_WIDTH + this.HALF_WIDTH;
            const startY = path[0][1] * this.ROW_HEIGHT + this.HALF_HEIGHT;

            g.moveTo(startX, startY);

            for (let i = 1; i < path.length; i++) {
                const nextX = path[i][0] * this.COL_WIDTH + this.HALF_WIDTH;
                const nextY = path[i][1] * this.ROW_HEIGHT + this.HALF_HEIGHT;
                g.lineTo(nextX, nextY);
            }

            g.stroke({ width: 6, color: line.color, alpha: 0.4, cap: 'round', join: 'round' });
            lineContainer.addChild(g);

            const mask = new Graphics()
                .rect(0, 0, this.COL_WIDTH * 3, this.ROW_HEIGHT * 3)
                .fill(0xffffff);
            mask.width = 0;
            lineContainer.addChild(mask);
            g.mask = mask;

            gsap.to(mask, {
                width: this.COL_WIDTH * 3,
                duration: 0.4,
                delay: index * 0.2,
                ease: 'power1.out',
            });
        });
    }

    public clear() {
        this.removeChildren();
    }
}
