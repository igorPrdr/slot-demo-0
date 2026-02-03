import './App.css';

import { useEffect, useRef, useState } from 'react';
import { Application, extend } from '@pixi/react';
import { Container, Sprite, Graphics, Ticker } from 'pixi.js';

import bgImage from './assets/app_background.jpg';
import { AssetLoader } from './game/Assets';
import { SlotMachineContainer } from './game/SlotMachineConatainer.ts';
import { useSlotMachine } from './game/useSlotMachine.ts';
import { GameInterface } from './game/ui/GameInterface.tsx';
import { useWindowResize } from './hooks/useWindowResize';

extend({ Container, Sprite, Graphics });

const DESIGN_WIDTH = 800;
const DESIGN_HEIGHT = 700;

const App = () => {
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const layout = useWindowResize(DESIGN_WIDTH, DESIGN_HEIGHT);
    const game = useSlotMachine(1000);

    const slotMachineRef = useRef<SlotMachineContainer | null>(null);

    useEffect(() => {
        AssetLoader.init().then(() => setAssetsLoaded(true));
    }, []);

    useEffect(() => {
        if (!assetsLoaded) return;
        const tick = (ticker: Ticker) => {
            slotMachineRef.current?.update(ticker.deltaTime);
        };
        Ticker.shared.add(tick);
        return () => {
            Ticker.shared.remove(tick);
        };
    }, [assetsLoaded]);

    if (!assetsLoaded) {
        return <div className='loading'>Loading Assets...</div>;
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                background: '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.8)',
                    zIndex: 0,
                }}
            />
            <div style={{ position: 'absolute', zIndex: 1 }}>
                <Application
                    backgroundAlpha={0}
                    width={layout.width}
                    height={layout.height}
                    roundPixels={false}
                    resolution={window.devicePixelRatio || 1}
                    autoDensity={true}
                    antialias={false}
                >
                    <pixiContainer
                        scale={layout.scale}
                        x={layout.x}
                        y={layout.y}
                        pivot={{ x: DESIGN_WIDTH / 2, y: DESIGN_HEIGHT / 2 }}
                    >
                        <pixiContainer x={DESIGN_WIDTH / 2} y={DESIGN_HEIGHT / 2 - 14}>
                            <pixiContainer
                                x={0}
                                y={0}
                                ref={(node) => {
                                    if (node && !slotMachineRef.current) {
                                        const sm = new SlotMachineContainer();
                                        node.addChild(sm);
                                        slotMachineRef.current = sm;
                                    }
                                }}
                            />
                        </pixiContainer>
                    </pixiContainer>
                </Application>
            </div>
            <GameInterface
                balance={game.balance}
                bet={game.bet}
                winAmount={game.winAmount}
                isSpinning={game.isSpinning}
                forceWin={game.forceWin}
                onToggleForceWin={game.setForceWin}
                onAdjustBet={game.adjustBet}
                onSpin={() => game.spin(slotMachineRef.current)}
            />
        </div>
    );
};

export default App;
