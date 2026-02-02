import { Container, Sprite, Graphics, BlurFilter } from 'pixi.js';
import { AssetLoader, SYMBOLS } from './Assets';
import { SLOT_CONFIG, SYMBOL_COLORS } from './Config';
import gsap from 'gsap';
import type { ReelSymbol } from './types.ts';

export class ReelSymbolContainer extends Container {
    private _mainSprite: Sprite;
    private _glow: Sprite;

    private _glareLayer: Container;

    private _particles: Container;
    private _textureId: string = '';
    private _currentColor: number = 0xffffff;

    private _isSpecial = false;
    private static SPECIAL_SYMBOLS = ['CROWN', 'COIN', 'GOLD'];

    constructor() {
        super();

        this._glow = new Sprite();
        this._glow.anchor.set(0.5);
        this._glow.scale.set(SLOT_CONFIG.SYMBOL_SCALE * 1.2);
        this._glow.blendMode = 'add';
        this._glow.alpha = 0;

        const glowBlurFilter = new BlurFilter();
        glowBlurFilter.strength = 15;
        glowBlurFilter.quality = 3;
        this._glow.filters = [glowBlurFilter];
        this.addChild(this._glow);

        this._mainSprite = new Sprite();
        this._mainSprite.anchor.set(0.5);
        this._mainSprite.scale.set(SLOT_CONFIG.SYMBOL_SCALE);
        this.addChild(this._mainSprite);

        this._glareLayer = new Container();
        this.addChild(this._glareLayer);

        this._particles = new Container();
        this.addChild(this._particles);
    }

    public setTexture(textureId: ReelSymbol) {
        if (this._textureId === textureId) return;

        this._textureId = textureId;
        const tex = AssetLoader.getSymbolTexture(SYMBOLS[textureId]);

        this._mainSprite.texture = tex;
        this._glow.texture = tex;

        this._currentColor = SYMBOL_COLORS[textureId] || 0xffffff;
        this._glow.tint = this._currentColor;

        this._isSpecial = ReelSymbolContainer.SPECIAL_SYMBOLS.includes(textureId);

        this.reset();
    }

    public playWin() {
        this.stopEffects();
        const baseScale = SLOT_CONFIG.SYMBOL_SCALE;

        gsap.killTweensOf(this._mainSprite.scale);
        this._mainSprite.scale.set(baseScale);
        gsap.to(this._mainSprite.scale, {
            x: baseScale * 1.1,
            y: baseScale * 1.1,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: 'back.out(1.5)',
        });

        this.playSustainedGlow(baseScale);

        if (this._isSpecial) {
            this.playGlare();
            this.emitSparkles(12);
        } else {
            this.emitSimpleParticles(8);
        }
    }

    private playSustainedGlow(baseScale: number) {
        gsap.killTweensOf(this._glow);
        gsap.killTweensOf(this._glow.scale);

        this._glow.alpha = 0;
        this._glow.scale.set(baseScale * 1.2);

        gsap.to(this._glow, { alpha: 1, duration: 0.1, ease: 'power2.out' });

        gsap.to(this._glow.scale, {
            x: baseScale * 1.5,
            y: baseScale * 1.5,
            duration: 0.2,
            ease: 'back.out(1.1)',
            onComplete: () => {
                gsap.to(this._glow, { alpha: 0.5, duration: 0.5, ease: 'sine.out' });
                gsap.to(this._glow.scale, {
                    x: baseScale * 1.15,
                    y: baseScale * 1.15,
                    duration: 0.5,
                    ease: 'sine.out',
                    onComplete: () => {
                        gsap.to(this._glow, {
                            alpha: 0.3,
                            duration: 1.5,
                            yoyo: true,
                            repeat: -1,
                            ease: 'sine.inOut',
                        });
                    },
                });
            },
        });
    }

    public reset() {
        gsap.killTweensOf(this._mainSprite.scale);
        gsap.killTweensOf(this._glow);
        gsap.killTweensOf(this._glow.scale);

        this._mainSprite.scale.set(SLOT_CONFIG.SYMBOL_SCALE);
        this._glow.scale.set(SLOT_CONFIG.SYMBOL_SCALE * 1.2);

        this._glareLayer.removeChildren();
        this._particles.removeChildren();

        if (this._isSpecial) {
            this.startSpecialIdle();
        } else {
            this._glow.alpha = 0;
        }
    }

    private playGlare() {
        const glare = new Graphics();

        glare.rect(-60, -2, 120, 4).fill(0xffffff);
        glare.rect(-2, -50, 4, 100).fill(0xffffff);
        glare.circle(0, 0, 15).fill({ color: 0xffffff, alpha: 0.8 });

        glare.alpha = 0;
        glare.scale.set(0);
        glare.rotation = Math.random() * Math.PI;
        glare.blendMode = 'add';

        this._glareLayer.addChild(glare);

        const tl = gsap.timeline({ onComplete: () => glare.destroy() });
        tl.to(glare, { alpha: 1, scale: 1.5, duration: 0.1, ease: 'power2.out' }).to(glare, {
            alpha: 0,
            scale: 0,
            rotation: glare.rotation + Math.PI / 2,
            duration: 0.4,
            ease: 'power2.in',
        });
    }

    private emitSparkles(count: number) {
        for (let i = 0; i < count; i++) {
            const star = new Graphics();
            star.fill(this._currentColor);

            star.poly([0, -10, 3, 0, 0, 10, -3, 0]);
            star.fill();

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 45;
            star.x = Math.cos(angle) * dist;
            star.y = Math.sin(angle) * dist;

            star.scale.set(0);
            star.rotation = Math.random() * Math.PI;
            this._particles.addChild(star);

            const delay = Math.random() * 0.2;
            const duration = 0.4 + Math.random() * 0.4;

            gsap.to(star, {
                rotation: star.rotation + 1,
                duration: duration + 0.2,
                delay,
            });
            gsap.to(star.scale, {
                x: 1,
                y: 1,
                duration: duration / 2,
                yoyo: true,
                repeat: 1,
                delay: delay,
                ease: 'sine.inOut',
                onComplete: () => star.destroy(),
            });
        }
    }

    private emitSimpleParticles(count: number) {
        for (let i = 0; i < count; i++) {
            const p = new Graphics();

            const isShard = Math.random() > 0.5;

            if (isShard) {
                p.poly([0, -4, 3, 0, 0, 4, -3, 0]);
                p.fill(this._currentColor);
            } else {
                p.circle(0, 0, 2);
                p.fill(this._currentColor);
            }

            p.x = (Math.random() - 0.5) * 10;
            p.y = (Math.random() - 0.5) * 10;
            p.rotation = Math.random() * Math.PI * 2;

            this._particles.addChild(p);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 30 + Math.random() * 50;

            const targetX = Math.cos(angle) * velocity;
            const targetY = Math.sin(angle) * velocity;

            gsap.to(p, {
                x: targetX,
                y: targetY + 30,
                rotation: isShard ? Math.random() * 10 : 0,
                duration: 0.5 + Math.random() * 0.3,
                ease: 'power2.out',
                onComplete: () => p.destroy(),
            });

            p.scale.set(0);
            gsap.to(p.scale, {
                x: isShard ? 1 : 1.5,
                y: isShard ? 1 : 1.5,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: 'sine.out',
            });
        }
    }

    private startSpecialIdle() {
        this.stopEffects();
        this._glow.alpha = 0.2;
        const baseGlowScale = SLOT_CONFIG.SYMBOL_SCALE * 1.15;
        this._glow.scale.set(baseGlowScale);

        gsap.to(this._glow, {
            alpha: 0.5,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });
        gsap.to(this._glow.scale, {
            x: baseGlowScale * 1.05,
            y: baseGlowScale * 1.05,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });
    }

    private stopEffects() {
        gsap.killTweensOf(this._glow);
        gsap.killTweensOf(this._glow.scale);
        this._glow.alpha = 0;
    }
}
