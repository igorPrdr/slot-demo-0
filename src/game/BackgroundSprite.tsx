import React, { useMemo } from 'react';
import { Texture } from 'pixi.js';
import { useApplication } from '@pixi/react';

interface BackgroundSpriteProps {
    textureAlias: string;
}

export const BackgroundSprite: React.FC<BackgroundSpriteProps> = ({ textureAlias }) => {
    const application = useApplication();
    const texture = useMemo(() => Texture.from(textureAlias), [textureAlias]);
    const layout = useMemo(() => {
        const app = application?.app;

        const isReady = app && app.renderer;

        const screenWidth = isReady ? app.screen.width : 0;
        const screenHeight = isReady ? app.screen.height : 0;

        const texWidth = texture.width > 0 ? texture.width : 1;
        const texHeight = texture.height > 0 ? texture.height : 1;

        const scale = Math.max(screenWidth / texWidth, screenHeight / texHeight);

        return {
            x: screenWidth / 2,
            y: screenHeight / 2,
            scale: scale,
        };
    }, [application, texture.width, texture.height]);

    return (
        <pixiSprite
            texture={texture}
            anchor={0.5}
            x={layout.x}
            y={layout.y}
            scale={layout.scale}
            tint={0xcccccc}
        />
    );
};
