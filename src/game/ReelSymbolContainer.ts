import { Container, Sprite, Graphics, BlurFilter } from 'pixi.js';
import { AssetLoader, SYMBOLS } from './Assets';
import { SLOT_CONFIG, SYMBOL_COLORS } from './Config';
import gsap from 'gsap';
import type { ReelSymbol } from './types.ts';

export class ReelSymbolContainer extends Container {
    private _mainSprite: Sprite;

    private _glow: Sprite | null = null;
    private _glareLayer: Container | null = null;
    private _particles: Container | null = null;

    private _textureId: ReelSymbol | null = null;
    private _currentColor: number = 0xffffff;

    private _isSpecial = false;
    private static SPECIAL_SYMBOLS = ['CROWN', 'COIN', 'GOLD'];

    constructor() {
        super();

        this._mainSprite = new Sprite();
        this._mainSprite.anchor.set(0.5);
        this._mainSprite.scale.set(SLOT_CONFIG.SYMBOL_SCALE);
        this.addChild(this._mainSprite);
    }

    private getGlow(): Sprite {
        if (!this._glow) {
            this._glow = new Sprite();
            this._glow.anchor.set(0.5);
            this._glow.scale.set(SLOT_CONFIG.SYMBOL_SCALE * 1.2);
            this._glow.blendMode = 'add';
            this._glow.alpha = 0;

            const glowBlurFilter = new BlurFilter();
            glowBlurFilter.strength = 15;
            glowBlurFilter.quality = 2; // Optimization: Drop quality slightly for mobile
            this._glow.filters = [glowBlurFilter];

            if (this._textureId) {
                this._glow.texture = AssetLoader.getTexture(SYMBOLS[this._textureId]);
                this._glow.tint = this._currentColor;
            }

            this.addChildAt(this._glow, 0);
        }

        if (!this._glow.parent) {
            this.addChildAt(this._glow, 0);
        }

        return this._glow;
    }

    private getGlareLayer(): Container {
        if (!this._glareLayer) {
            this._glareLayer = new Container();
            this.addChild(this._glareLayer);
        } else if (!this._glareLayer.parent) {
            this.addChild(this._glareLayer);
        }
        return this._glareLayer;
    }

    private getParticles(): Container {
        if (!this._particles) {
            this._particles = new Container();
            this.addChild(this._particles);
        } else if (!this._particles.parent) {
            this.addChild(this._particles);
        }
        return this._particles;
    }

    public setTexture(textureId: ReelSymbol) {
        if (this._textureId === textureId) return;

        this._textureId = textureId;
        const tex = AssetLoader.getTexture(SYMBOLS[textureId]);

        this._mainSprite.texture = tex;

        if (this._glow) {
            this._glow.texture = tex;
            this._glow.tint = SYMBOL_COLORS[textureId] || 0xffffff;
        }

        this._currentColor = SYMBOL_COLORS[textureId] || 0xffffff;
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
        const glow = this.getGlow();

        gsap.killTweensOf(glow);
        gsap.killTweensOf(glow.scale);

        glow.alpha = 0;
        glow.scale.set(baseScale * 1.2);

        gsap.to(glow, { alpha: 1, duration: 0.1, ease: 'power2.out' });

        gsap.to(glow.scale, {
            x: baseScale * 1.5,
            y: baseScale * 1.5,
            duration: 0.2,
            ease: 'back.out(1.1)',
            onComplete: () => {
                gsap.to(glow, { alpha: 0.5, duration: 0.5, ease: 'sine.out' });
                gsap.to(glow.scale, {
                    x: baseScale * 1.15,
                    y: baseScale * 1.15,
                    duration: 0.5,
                    ease: 'sine.out',
                    onComplete: () => {
                        gsap.to(glow, {
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
        this._mainSprite.scale.set(SLOT_CONFIG.SYMBOL_SCALE);

        if (this._glow) {
            gsap.killTweensOf(this._glow);
            gsap.killTweensOf(this._glow.scale);
        }

        if (this._particles) {
            this._particles.removeChildren();
            if (this._particles.parent) this.removeChild(this._particles);
        }

        if (this._glareLayer) {
            this._glareLayer.removeChildren();
            if (this._glareLayer.parent) this.removeChild(this._glareLayer);
        }

        if (this._isSpecial) {
            this.startSpecialIdle();
        } else {
            if (this._glow && this._glow.parent) {
                this.removeChild(this._glow);
            }
        }
    }

    private playGlare() {
        const layer = this.getGlareLayer();

        const glare = new Graphics();
        glare.rect(-60, -2, 120, 4).fill(0xffffff);
        glare.rect(-2, -50, 4, 100).fill(0xffffff);
        glare.circle(0, 0, 15).fill({ color: 0xffffff, alpha: 0.8 });

        glare.alpha = 0;
        glare.scale.set(0);
        glare.rotation = Math.random() * Math.PI;
        glare.blendMode = 'add';

        layer.addChild(glare);

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
        const container = this.getParticles();

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

            container.addChild(star);

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
        const container = this.getParticles();

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

            container.addChild(p);

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
        const glow = this.getGlow(); // Init here

        glow.alpha = 0.2;
        const baseGlowScale = SLOT_CONFIG.SYMBOL_SCALE * 1.15;
        glow.scale.set(baseGlowScale);

        gsap.to(glow, {
            alpha: 0.5,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });
        gsap.to(glow.scale, {
            x: baseGlowScale * 1.05,
            y: baseGlowScale * 1.05,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });
    }

    private stopEffects() {
        if (this._glow) {
            gsap.killTweensOf(this._glow);
            gsap.killTweensOf(this._glow.scale);
            this._glow.alpha = 0;
        }
    }
}
