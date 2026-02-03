import React, { useMemo } from 'react';
import { Texture } from 'pixi.js';
import { useApplication } from '@pixi/react';

interface BackgroundSpriteProps {
    textureAlias: string;
}

export const BackgroundSprite: React.FC<BackgroundSpriteProps> = ({ textureAlias }) => {
    const application = useApplication();
    const texture = useMemo(() => Texture.from(textureAlias), [textureAlias]);
    const { width: screenWidth, height: screenHeight } = application.app.screen;
    const scale = Math.max(screenWidth / texture.width, screenHeight / texture.height);

    return (
        <pixiSprite
            texture={texture}
            anchor={0.5}
            x={screenWidth / 2}
            y={screenHeight / 2}
            scale={scale}
            tint={0xcccccc}
        />
    );
};
