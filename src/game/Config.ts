import type { ReelSymbol } from './types.ts';

const REEL_COUNT = 3;
const SYMBOL_WIDTH = 160;
const SYMBOL_HEIGHT = 160;
const REEL_GAP = 20;
const VISIBLE_ROWS = 3;

const TOTAL_WIDTH = REEL_COUNT * SYMBOL_WIDTH + (REEL_COUNT - 1) * REEL_GAP;
const TOTAL_HEIGHT = VISIBLE_ROWS * SYMBOL_HEIGHT;

export const SLOT_CONFIG = {
    REEL_COUNT,
    SYMBOL_WIDTH,
    SYMBOL_HEIGHT,
    REEL_GAP,
    VISIBLE_ROWS,

    MACHINE_WIDTH: TOTAL_WIDTH,
    MACHINE_HEIGHT: TOTAL_HEIGHT,

    CENTER_X: TOTAL_WIDTH / 2,
    CENTER_Y: TOTAL_HEIGHT / 2,

    SYMBOLS_PER_REEL_STRIP: 5,
    SYMBOL_SCALE: 140 / 250,
};

export const WIN_LINES = [
    {
        id: 'middle',
        path: [
            [0, 1],
            [1, 1],
            [2, 1],
        ],
        color: 0xff0000,
        multiplier: 5.0,
    },
    {
        id: 'diag_tl_br',
        path: [
            [0, 0],
            [1, 1],
            [2, 2],
        ],
        color: 0xffff00,
        multiplier: 2.0,
    },
    {
        id: 'diag_bl_tr',
        path: [
            [0, 2],
            [1, 1],
            [2, 0],
        ],
        color: 0xffff00,
        multiplier: 2.0,
    },
    {
        id: 'v_shape',
        path: [
            [0, 0],
            [1, 1],
            [2, 0],
        ],
        color: 0x00ffff,
        multiplier: 2.0,
    },
    {
        id: 'v_reversed',
        path: [
            [0, 2],
            [1, 1],
            [2, 2],
        ],
        color: 0xff8800,
        multiplier: 2.0,
    },
    {
        id: 'zag_up',
        path: [
            [0, 1],
            [1, 1],
            [2, 0],
        ],
        color: 0x00ff00,
        multiplier: 1.0,
    },
    {
        id: 'zag_down',
        path: [
            [0, 1],
            [1, 1],
            [2, 2],
        ],
        color: 0x00ff00,
        multiplier: 1.0,
    },
    {
        id: 'zig_top',
        path: [
            [0, 0],
            [1, 1],
            [2, 1],
        ],
        color: 0x0000ff,
        multiplier: 1.0,
    },
    {
        id: 'zig_bot',
        path: [
            [0, 2],
            [1, 1],
            [2, 1],
        ],
        color: 0x0000ff,
        multiplier: 1.0,
    },
];

export const REEL_STRIPS: ReelSymbol[][] = [
    [
        'CROWN',
        'LEMON',
        'GRAPE',
        'FIG',
        'GOLD',
        'APPLE',
        'FIG',
        'LEMON',
        'COIN',
        'PLUMP',
        'STRAWBERRY',
        'APPLE',
        'CROWN',
        'BLUEBERRY',
        'LEMON',
        'GRAPE',
        'GOLD',
        'FIG',
        'PLUMP',
        'COIN',
    ],
    [
        'GOLD',
        'PEACH',
        'STRAWBERRY',
        'APPLE',
        'CROWN',
        'LEMON',
        'GRAPE',
        'FIG',
        'COIN',
        'FIG',
        'APPLE',
        'PLUMP',
        'GOLD',
        'PLUMP',
        'BLUEBERRY',
        'LEMON',
        'CROWN',
        'STRAWBERRY',
        'GRAPE',
        'COIN',
    ],
    [
        'COIN',
        'LEMON',
        'GRAPE',
        'FIG',
        'GOLD',
        'APPLE',
        'FIG',
        'PLUMP',
        'CROWN',
        'PLUMP',
        'STRAWBERRY',
        'APPLE',
        'COIN',
        'BLUEBERRY',
        'LEMON',
        'PEACH',
        'GOLD',
        'GRAPE',
        'FIG',
        'CROWN',
    ],
];

export const PAYTABLE: Record<ReelSymbol | 'default', number> = {
    CROWN: 20,
    GOLD: 10,
    COIN: 5,

    APPLE: 2,
    BLUEBERRY: 2,
    FIG: 2,
    GRAPE: 2,
    LEMON: 2,
    PEACH: 2,
    PLUMP: 2,
    STRAWBERRY: 2,

    default: 1,
};

export const SYMBOL_COLORS: Record<string, number> = {
    APPLE: 0xff3333,
    BLUEBERRY: 0x4169e1,
    COIN: 0xffd700,
    CROWN: 0xffa500,
    FIG: 0x800080,
    GOLD: 0xffe135,
    GRAPE: 0x9370db,
    LEMON: 0xffff00,
    PEACH: 0xff9966,
    PLUMP: 0xda70d6,
    STRAWBERRY: 0xff0066,
};
