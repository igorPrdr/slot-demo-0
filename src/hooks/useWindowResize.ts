import { useState, useEffect } from 'react';

export const useWindowResize = (designWidth: number, designHeight: number) => {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
        scale: 1,
        x: 0,
        y: 0,
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const scaleX = width / designWidth;
            const scaleY = height / designHeight;
            const scale = Math.min(scaleX, scaleY) * 0.95;

            setDimensions({
                width,
                height,
                scale,
                x: width / 2,
                y: height / 2,
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [designWidth, designHeight]);

    return dimensions;
};
