import { useState, useCallback } from 'react';
import { MockBackend } from './MockBackend.ts';
import { SlotMachineContainer } from './SlotMachineConatainer.ts';

export const useSlotMachine = (initialBalance: number) => {
    const [balance, setBalance] = useState(initialBalance);
    const [bet, setBet] = useState(10);
    const [winAmount, setWinAmount] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [forceWin, setForceWin] = useState(false);

    const adjustBet = useCallback(
        (amount: number) => {
            if (isSpinning) return;
            setBet((prev) => {
                let next = prev + amount;

                if (prev === 1 && amount > 0) next = 5;
                if (prev === 5 && amount < 0) next = 1;

                return Math.min(100, Math.max(1, next));
            });
        },
        [isSpinning],
    );

    const spin = async (slotMachine: SlotMachineContainer | null) => {
        if (!slotMachine || isSpinning) return;
        if (balance < bet) {
            alert('Not enough credits!');
            return;
        }

        setBalance((b) => b - bet);
        setWinAmount(0);
        setIsSpinning(true);

        slotMachine.spin();

        try {
            const data = await MockBackend.spin(bet, forceWin);

            await slotMachine.stop(data.stops);

            setIsSpinning(false);

            if (data.winAmount > 0) {
                setBalance((b) => b + data.winAmount);
                setWinAmount(data.winAmount);
                slotMachine.highlightWins(data.winLines);
            }
        } catch (error) {
            console.error(error);
            setIsSpinning(false);
        }
    };

    return {
        balance,
        bet,
        winAmount,
        isSpinning,
        adjustBet,
        forceWin,
        setForceWin,
        spin,
    };
};
