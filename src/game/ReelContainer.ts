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
    private _braking = false;

    private _blur = new BlurFilter();
    private _speed = 0;
    private _tweenValue = 0;
    private _lastTweenVal = 0;

    private readonly BLUR_MULTIPLIER = 0.3;

    constructor(reelId: number, x: number) {
        super();
        this.x = x;
        this._strip = REEL_STRIPS[reelId];
        this._currentTopIndex = Math.floor(Math.random() * this._strip.length);

        for (let i = 0; i < this._totalSymbols; i++) {
            const symbol = new ReelSymbolContainer();
            const initialTextureId = this.getSymbolIdAt(this._currentTopIndex + i);
            symbol.setTexture(initialTextureId);
            symbol.x = SLOT_CONFIG.SYMBOL_WIDTH / 2;
            symbol.y = (i - 1) * this._symbolHeight + this._symbolHeight / 2;
            this.addChild(symbol);
            this._symbols.push(symbol);
        }

        this._blur.quality = 3;
        this._blur.strengthX = 0;
        this._blur.strengthY = 0;
    }

    public spin() {
        this.isSpinning = true;
        this._braking = false;

        this._speed = 0;
        gsap.to(this, { _speed: 40, duration: 0.1, ease: 'power2.in' });
    }

    public stop(targetIndex: number): Promise<void> {
        return new Promise((resolve) => {
            const startSpeed = this._speed;
            gsap.killTweensOf(this);
            this._braking = true;

            const len = this._strip.length;
            const currentNorm = ((this._currentTopIndex % len) + len) % len;
            const targetHiddenIndex = (targetIndex - 1 + len) % len;

            let deltaIndices = currentNorm - targetHiddenIndex;
            if (deltaIndices < 0) deltaIndices += len;

            this._symbols.sort((a, b) => a.y - b.y);
            const topSymbol = this._symbols[1];
            const targetY = SLOT_CONFIG.SYMBOL_HEIGHT / 2;
            const alignmentCorrection = targetY - topSymbol.y;

            const minPixelDist = deltaIndices * this._symbolHeight + alignmentCorrection;
            const stripPixelHeight = len * this._symbolHeight;

            const frictionFactor = 0.19;
            const targetTime = 2.2;
            const predictedDist = startSpeed * 60 * targetTime * frictionFactor;

            let finalDist = minPixelDist;
            while (finalDist < predictedDist) {
                finalDist += stripPixelHeight;
            }

            const halfHeight = this._symbolHeight / 2;
            const randomOffset = Math.random() * this._symbolHeight - halfHeight;

            const distWithOffset = finalDist + randomOffset;

            const exactDuration = distWithOffset / (startSpeed * 60 * frictionFactor);

            this._tweenValue = 0;
            this._lastTweenVal = 0;
            let actualDistanceTraveled = 0;
            const MIN_CRAWL_SPEED = 0.1;

            gsap.to(this, {
                _tweenValue: distWithOffset,
                duration: exactDuration,
                ease: 'expo.out',
                onUpdate: () => {
                    const currentVal = this._tweenValue;
                    let delta = currentVal - this._lastTweenVal;
                    this._lastTweenVal = currentVal;

                    if (delta < MIN_CRAWL_SPEED) delta = MIN_CRAWL_SPEED;

                    const remaining = distWithOffset - actualDistanceTraveled;

                    if (remaining <= delta) {
                        this.moveReel(remaining);
                        gsap.killTweensOf(this);
                        this.playCorrection(-randomOffset, resolve);
                        return;
                    }

                    this._speed = delta;
                    this.moveReel(delta);
                    actualDistanceTraveled += delta;
                },
                onComplete: () => {
                    this.playCorrection(-randomOffset, resolve);
                },
            });
        });
    }

    private playCorrection(correctionDist: number, onComplete: () => void) {
        this._blur.strengthY = 0;
        this.filters = null;

        const obj = { val: 0 };

        let duration = 0;
        let delay = 0;

        const ease = 'power3.inOut';

        const absDist = Math.abs(correctionDist);
        const isBigCorrection = absDist > 20;

        if (correctionDist > 0) {
            duration = Math.max(0.3, absDist * 0.01);

            if (isBigCorrection) {
                delay = 0.1 + absDist * 0.003;
            }
        } else {
            duration = Math.max(0.2, absDist * 0.008);

            if (isBigCorrection) {
                delay = 0.1 + absDist * 0.002;
            }
        }

        gsap.to(obj, {
            val: correctionDist,
            duration: duration,
            ease: ease,
            delay: delay,
            onUpdate: () => {
                const currentVal = obj.val;
                const delta = currentVal - this._lastTweenVal;
                this._lastTweenVal = currentVal;
                this.moveReel(delta);
            },
            onComplete: () => {
                this.isSpinning = false;
                this._braking = false;
                this._lastTweenVal = 0;
                onComplete();
            },
        });
        this._lastTweenVal = 0;
    }

    private getSymbolIdAt(index: number): ReelSymbol {
        const len = this._strip.length;
        const normalized = ((index % len) + len) % len;
        return this._strip[normalized];
    }

    public highlightSymbol(rowIndex: number) {
        const expectedY = rowIndex * this._symbolHeight + this._symbolHeight / 2;

        let closestSymbol: ReelSymbolContainer | null = null;
        let minDistance = Infinity;

        for (const symbol of this._symbols) {
            const distance = Math.abs(symbol.y - expectedY);
            if (distance < minDistance) {
                minDistance = distance;
                closestSymbol = symbol;
            }
        }

        if (closestSymbol && minDistance < this._symbolHeight / 2) {
            closestSymbol.playWin();
        } else {
            console.warn(`Highlight Error: No symbol found near Row ${rowIndex} (y=${expectedY})`);
        }
    }

    public resetSymbols() {
        this._symbols.forEach((s) => s.reset());
    }

    public update(delta: number) {
        if (!this.isSpinning) return;
        if (!this._braking) {
            this.moveReel(this._speed * delta);
        }
    }

    private moveReel(amount: number) {
        const absAmount = Math.abs(amount);

        if (absAmount > 9) {
            if (!this.filters) {
                this.filters = [this._blur];
            }
            this._blur.strengthY = absAmount * this.BLUR_MULTIPLIER;
        } else {
            this.filters = null;
            this._blur.strengthY = 0;
        }

        this._symbols.forEach((symbol) => (symbol.y += amount));

        const limit = (this._totalSymbols - 1) * this._symbolHeight + this._symbolHeight / 2;

        this._symbols.forEach((symbol) => {
            if (symbol.y >= limit) {
                symbol.y -= this._totalSymbols * this._symbolHeight;
                this._currentTopIndex--;

                const newId = this.getSymbolIdAt(this._currentTopIndex);
                symbol.setTexture(newId);
                symbol.reset();
            }
        });
    }
}
