import { Container, BlurFilter } from 'pixi.js';
import { REEL_STRIPS, SLOT_CONFIG } from './Config';
import gsap from 'gsap';
import { ReelSymbolContainer } from './ReelSymbolContainer.ts';
import type { ReelSymbol } from './types.ts';

export class ReelContainer extends Container {
    private _symbols: ReelSymbolContainer[] = [];
    private _symbolHeight = SLOT_CONFIG.SYMBOL_HEIGHT;
    private _totalSymbols = SLOT_CONFIG.SYMBOLS_PER_REEL_STRIP;

    private _strip: ReelSymbol[];
    private _currentTopIndex: number = 0;

    public isSpinning = false;
    private _stopping = false;

    private _speed = 0;
    private _symbolsRemaining = -1;

    private _landingOvershoot = 0;
    private _isOvershot = false;

    private _landingSymbol: ReelSymbolContainer | null = null;
    private _maxLandingSpeed = 0;

    private _spinUpPromise: Promise<void> | null = null;
    private _blur = new BlurFilter();
    private readonly BLUR_MULTIPLIER = 0.5;

    private _onStopComplete: (() => void) | null = null;

    constructor(reelId: number, x: number) {
        super();
        this.x = x;
        this._strip = REEL_STRIPS[reelId];
        this._currentTopIndex = Math.floor(Math.random() * this._strip.length);
        this.interactiveChildren = false;

        for (let i = 0; i < this._totalSymbols; i++) {
            const symbol = new ReelSymbolContainer();
            const initialTextureId = this.getSymbolIdAt(this._currentTopIndex + i);
            symbol.setTexture(initialTextureId);
            symbol.x = SLOT_CONFIG.SYMBOL_WIDTH / 2;
            symbol.y = (i - 1) * this._symbolHeight + this._symbolHeight / 2;
            this.addChild(symbol);
            this._symbols.push(symbol);
        }

        this._blur.quality = 1;
        this._blur.resolution = 1;
        this._blur.strengthX = 0;
        this._blur.strengthY = 0;
    }

    public spin() {
        this.isSpinning = true;
        this._stopping = false;
        this._symbolsRemaining = -1;
        this._speed = 0;
        this._isOvershot = false;

        this._landingSymbol = null;
        this._maxLandingSpeed = 0;

        const range = this._symbolHeight / 2;
        this._landingOvershoot = Math.random() * range * 2 - range;

        this._spinUpPromise = new Promise((resolve) => {
            gsap.to(this, {
                _speed: 50,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    resolve();
                    this._spinUpPromise = null;
                },
            });
        });
    }

    public async stop(targetIndex: number): Promise<void> {
        if (this._spinUpPromise) await this._spinUpPromise;

        return new Promise((resolve) => {
            if (this._stopping) return;
            this._stopping = true;
            this._onStopComplete = resolve;

            gsap.killTweensOf(this);

            const MIN_SPIN = 14;
            const len = this._strip.length;
            const currentHeadIndex = ((this._currentTopIndex % len) + len) % len;

            const targetHeadIndex = (((targetIndex + 1) % len) + len) % len;

            let delta = currentHeadIndex - targetHeadIndex;
            if (delta < 0) delta += len;

            let symbolsToPass = delta;
            while (symbolsToPass < MIN_SPIN) {
                symbolsToPass += len;
            }

            this._symbolsRemaining = symbolsToPass;
        });
    }

    public update(delta: number) {
        if (!this.isSpinning) return;
        if (this._isOvershot) return;

        const BRAKING_WINDOW = 7;

        if (this._landingSymbol === null) {
            if (this._symbolsRemaining !== -1 && this._symbolsRemaining <= BRAKING_WINDOW) {
                const progress = this._symbolsRemaining / BRAKING_WINDOW;
                const curve = progress * progress;
                const targetSpeed = 3 + 47 * curve;
                this._speed += (targetSpeed - this._speed) * 0.1 * delta;
            }

            this._maxLandingSpeed = this._speed;
            this.moveReel(this._speed * delta);
            return;
        }

        const baseTargetY = this._symbolHeight * 1.5;
        const finalTargetY = baseTargetY + this._landingOvershoot;

        const dist = finalTargetY - this._landingSymbol.y;

        let finalMove = dist * 0.15 * delta;

        const speedCap = this._maxLandingSpeed * delta;
        if (finalMove > speedCap) finalMove = speedCap;

        const MIN_CRAWL = 1.0 * delta;
        if (finalMove < MIN_CRAWL) finalMove = MIN_CRAWL;

        if (dist <= 0 || finalMove >= dist) {
            this.moveReel(dist);
            this.triggerSuspensePause();
        } else {
            this._speed = finalMove;
            this.moveReel(finalMove);
        }
    }

    private triggerSuspensePause() {
        this._isOvershot = true;
        this._speed = 0;
        this.filters = null;
        this._landingSymbol = null;

        this.playCorrectionBounce();
    }

    private moveReel(amount: number) {
        const absAmount = Math.abs(amount);
        if (absAmount > 5) {
            if (!this.filters) this.filters = [this._blur];
            this._blur.strengthY = absAmount * this.BLUR_MULTIPLIER;
        } else {
            this.filters = null;
            this._blur.strengthY = 0;
        }

        const limit = (this._totalSymbols - 1) * this._symbolHeight + this._symbolHeight / 2;
        const totalStripHeight = this._totalSymbols * this._symbolHeight;

        for (const symbol of this._symbols) {
            symbol.y += amount;

            while (symbol.y >= limit) {
                symbol.y -= totalStripHeight;
                this._currentTopIndex--;

                const newId = this.getSymbolIdAt(this._currentTopIndex);
                symbol.setTexture(newId);
                symbol.reset();

                if (this._landingSymbol === null && this._symbolsRemaining > 0) {
                    this._symbolsRemaining--;

                    if (this._symbolsRemaining === 0) {
                        this._landingSymbol = symbol;
                    }
                }
            }
        }
    }

    private playCorrectionBounce() {
        this._blur.strengthY = 0;
        this.filters = null;

        const correctionDist = -this._landingOvershoot;
        const obj = { val: 0 };
        let lastTweenVal = 0;

        let duration = 0;
        let delay = 0;
        const ease = 'power3.in';
        const absDist = Math.abs(correctionDist);
        const isBigCorrection = absDist > 20;

        if (correctionDist > 0) {
            duration = Math.max(0.3, absDist * 0.01);
            if (isBigCorrection) delay = 0.1 + absDist * 0.01;
        } else {
            duration = Math.max(0.2, absDist * 0.008);
            if (isBigCorrection) delay = 0.1 + absDist * 0.005;
        }

        gsap.to(obj, {
            val: correctionDist,
            duration: duration,
            ease: ease,
            delay: delay,
            onUpdate: () => {
                const currentVal = obj.val;
                const delta = currentVal - lastTweenVal;
                lastTweenVal = currentVal;
                this.moveReel(delta);
            },
            onComplete: () => {
                this.finishStop();
            },
        });
    }

    private finishStop() {
        this.isSpinning = false;
        this._stopping = false;
        this._speed = 0;
        this.filters = null;
        // this.snapToGrid();

        if (this._onStopComplete) {
            this._onStopComplete();
            this._onStopComplete = null;
        }
    }

    private getSymbolIdAt(index: number): ReelSymbol {
        const len = this._strip.length;
        return this._strip[((index % len) + len) % len];
    }

    // @ts-expect-error works falsy yet
    private snapToGrid() {
        this._symbols.sort((a, b) => a.y - b.y);
        for (let i = 0; i < this._symbols.length; i++) {
            const symbol = this._symbols[i];
            symbol.y = (i - 1) * this._symbolHeight + this._symbolHeight / 2;
        }
    }

    public highlightSymbol(rowIndex: number) {
        const expectedY = rowIndex * this._symbolHeight + this._symbolHeight / 2;
        let closest: ReelSymbolContainer | null = null;
        let min = Infinity;
        for (const s of this._symbols) {
            const d = Math.abs(s.y - expectedY);
            if (d < min) {
                min = d;
                closest = s;
            }
        }
        if (closest && min < 50) closest.playWin();
    }

    public resetSymbols() {
        for (const s of this._symbols) s.reset();
    }
}
