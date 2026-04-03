/**
 * vsmud-control `prompts`：分组 + 仅序列化 true，减小 JSON 体积。
 */
import type { BrPrGroupedSnapshot, BrPrWire } from './types/brPr.js';

function pruneBoolGroup(g: object): Record<string, boolean> | undefined {
    const o: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(g)) {
        if (v === true) o[k] = true;
    }
    return Object.keys(o).length ? o : undefined;
}

/** 将完整分组快照压成仅含 true 的线结构；空组省略 */
export function pruneBrPrForWire(s: BrPrGroupedSnapshot): BrPrWire {
    const login = pruneBoolGroup(s.login);
    const card = pruneBoolGroup(s.card);
    const guide = pruneBoolGroup(s.guide);
    const sys = pruneBoolGroup(s.sys);
    const out: BrPrWire = {};
    if (login) out.login = login;
    if (card) out.card = card;
    if (guide) out.guide = guide;
    if (sys) out.sys = sys;
    if (s.myGiftTask) out.myGiftTask = s.myGiftTask;
    if (s.auxTaskFab) out.auxTaskFab = s.auxTaskFab;
    if (s.createUser === 1) out.createUser = 1;
    return out;
}
