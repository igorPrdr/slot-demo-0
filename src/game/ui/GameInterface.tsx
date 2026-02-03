import React, { useState } from 'react';

interface BouncyButtonProps {
    onClick: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
    children: React.ReactNode;
}

const BouncyButton: React.FC<BouncyButtonProps> = ({ onClick, disabled, style, children }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleDown = () => {
        if (disabled) return;
        setIsPressed(true);
    };

    const handleUp = () => {
        if (!disabled && isPressed) {
            setIsPressed(false);
            onClick();
        }
    };

    const handleLeave = () => setIsPressed(false);

    const transitionStyle = isPressed
        ? 'transform 0.1s ease-out'
        : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.5)';

    const combinedStyle: React.CSSProperties = {
        ...style,
        transform: isPressed ? 'scale(0.9)' : 'scale(1)',
        transition: transitionStyle,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        pointerEvents: 'auto',
    };

    return (
        <button
            style={combinedStyle}
            onPointerDown={handleDown}
            onPointerUp={handleUp}
            onPointerLeave={handleLeave}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

const RoundedPlayIcon: React.FC = () => (
    <svg width='100%' height='100%' viewBox='0 0 24 24' fill='none' style={{ maxWidth: '40px' }}>
        <path
            d='M7.53573 5.72569C6.30778 4.91972 4.66669 5.80152 4.66669 7.26891V16.7311C4.66669 18.1985 6.30778 19.0803 7.53573 18.2743L15.8257 12.8321C16.9088 12.1213 16.9088 10.5454 15.8257 9.83459L7.53573 5.72569Z'
            fill='currentColor'
        />
    </svg>
);

interface GameInterfaceProps {
    balance: number;
    bet: number;
    winAmount: number;
    isSpinning: boolean;
    forceWin: boolean;
    onToggleForceWin: (val: boolean) => void;
    onAdjustBet: (amount: number) => void;
    onSpin: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
    balance,
    bet,
    winAmount,
    isSpinning,
    forceWin,
    onToggleForceWin,
    onAdjustBet,
    onSpin,
}) => {
    const colors = {
        textMuted: '#aaaaaa',
        textHighlight: '#ffffff',
        gold: '#f1c40f',
        bgDark: 'rgba(0, 0, 0, 0.8)',
        spinBtnStart: '#e74c3c',
        spinBtnEnd: '#c0392b',
    };

    const spinBtnSize = 'clamp(70px, 18vw, 90px)';
    const smallBtnSize = 'clamp(28px, 9vw, 32px)';
    const fontSizeNum = 'clamp(16px, 5vw, 24px)';
    const fontSizeLabel = 'clamp(8px, 2.5vw, 10px)';
    const centerClearance = 'clamp(45px, 13vw, 70px)';

    const circleBtnBaseStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.1)',
        color: colors.textHighlight,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        width: smallBtnSize,
        height: smallBtnSize,
        padding: 0,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'normal',
        lineHeight: 0,
        userSelect: 'none',
    };

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontFamily: 'Arial, sans-serif',
                userSelect: 'none',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    paddingTop: 'max(15px, env(safe-area-inset-top))',
                    paddingRight: 'max(15px, env(safe-area-inset-right))',
                }}
            >
                <BouncyButton
                    onClick={() => onToggleForceWin(!forceWin)}
                    style={{
                        width: '75px',
                        borderRadius: '12px',
                        padding: '4px 0',
                        background: forceWin
                            ? 'linear-gradient(135deg, #f1c40f 0%, #d4ac0d 100%)'
                            : 'rgba(0, 0, 0, 0.6)',
                        border: forceWin
                            ? `1px solid ${colors.gold}`
                            : '1px solid rgba(255,255,255,0.15)',
                        color: forceWin ? '#000' : colors.textMuted,
                        fontSize: '9px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: forceWin ? '0 0 8px rgba(241, 196, 15, 0.4)' : 'none',
                    }}
                >
                    {forceWin ? 'FORCE WIN' : 'DEBUG'}
                </BouncyButton>
            </div>

            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: 'clamp(80px, 15vh, 90px)',
                    paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 20px))',
                    background: colors.bgDark,
                    backdropFilter: 'blur(4px)',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: '2%',
                    paddingLeft: '2%',
                    boxSizing: 'border-box',
                    pointerEvents: 'auto',
                }}
            >
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        paddingRight: centerClearance,
                        minWidth: '0',
                    }}
                >
                    <span
                        style={{
                            color: colors.textMuted,
                            fontSize: fontSizeLabel,
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                        }}
                    >
                        Total Bet
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            <BouncyButton
                                style={circleBtnBaseStyle}
                                onClick={() => onAdjustBet(-5)}
                                disabled={isSpinning}
                            >
                                &#8722;
                            </BouncyButton>
                        </div>

                        <span
                            style={{
                                color: colors.textHighlight,
                                fontSize: fontSizeNum,
                                fontWeight: 'bold',
                                minWidth: '30px',
                                textAlign: 'center',
                            }}
                        >
                            ${bet}
                        </span>

                        <div style={{ display: 'flex', gap: '2px' }}>
                            <BouncyButton
                                style={circleBtnBaseStyle}
                                onClick={() => onAdjustBet(5)}
                                disabled={isSpinning}
                            >
                                +
                            </BouncyButton>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bottom: 'calc(25px + env(safe-area-inset-bottom, 0px))',
                        zIndex: 20,
                    }}
                >
                    <BouncyButton
                        onClick={onSpin}
                        disabled={isSpinning || balance < bet}
                        style={{
                            width: spinBtnSize,
                            height: spinBtnSize,
                            borderRadius: '50%',
                            background: isSpinning
                                ? '#555'
                                : `linear-gradient(180deg, ${colors.spinBtnStart}, ${colors.spinBtnEnd})`,
                            color: 'white',
                            border: '4px solid rgba(0,0,0,0.3)',
                            boxShadow: isSpinning ? 'none' : '0 8px 15px rgba(0,0,0,0.5)',
                            marginBottom: '15%',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingLeft: '4px',
                        }}
                    >
                        <div
                            style={{
                                filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))',
                                lineHeight: 0,
                                transform: 'scale(0.8)',
                            }}
                        >
                            <RoundedPlayIcon />
                        </div>
                    </BouncyButton>
                </div>

                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingLeft: centerClearance,
                        minWidth: '0',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            alignItems: 'flex-start',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '-22px',
                                left: 0,
                                opacity: winAmount > 0 ? 1 : 0,
                                transform: winAmount > 0 ? 'translateY(0)' : 'translateY(10px)',
                                transition: 'all 0.3s ease-out',
                                pointerEvents: 'none',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <span
                                style={{
                                    color: colors.gold,
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    textShadow:
                                        '0 2px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6)',
                                }}
                            >
                                +${winAmount.toFixed(2)}
                            </span>
                        </div>

                        <span
                            style={{
                                color: colors.textMuted,
                                fontSize: fontSizeLabel,
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                            }}
                        >
                            Balance
                        </span>
                        <span
                            style={{
                                color: colors.textHighlight,
                                fontSize: fontSizeNum,
                                fontWeight: 'bold',
                            }}
                        >
                            ${balance.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
