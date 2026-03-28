/**
 * 从下行缓冲解析房间出口（与 nt7 cmds/std/look.c look_room 中 exits 文案一致）。
 */

const EXIT_TAIL_CHARS = 12000;

function stripAnsi(s: string): string {
    return s.replace(/\x1b\[[0-9;]*m/g, '');
}

const KNOWN_EXIT_KEYS = new Set([
    'north',
    'south',
    'east',
    'west',
    'northup',
    'southup',
    'eastup',
    'westup',
    'northdown',
    'southdown',
    'eastdown',
    'westdown',
    'northeast',
    'northwest',
    'southeast',
    'southwest',
    'up',
    'down',
    'enter',
    'out'
]);

const MARK_NONE = '这里没有任何明显的出路';
const MARK_SINGLE = '这里唯一的出口是';
const MARK_MULTI = '这里明显的出口是';

function parseMultiExitInner(innerRaw: string): string[] {
    const inner = innerRaw.trim().replace(/\s+/g, ' ');
    const parts = inner.split(/\s+和\s+/);
    const out: string[] = [];
    if (parts.length === 1) {
        for (const t of parts[0].split(/、/)) {
            const k = t.trim().toLowerCase();
            if (KNOWN_EXIT_KEYS.has(k)) out.push(k);
        }
    } else {
        for (let i = 0; i < parts.length - 1; i++) {
            for (const t of parts[i].split(/、/)) {
                const k = t.trim().toLowerCase();
                if (KNOWN_EXIT_KEYS.has(k)) out.push(k);
            }
        }
        const last = parts[parts.length - 1].trim().toLowerCase();
        if (KNOWN_EXIT_KEYS.has(last)) out.push(last);
    }
    return out;
}

/** null 表示缓冲中未命中出口描述，不更新 UI */
export function parseExitDirsFromMudBuffer(buf: string): string[] | null {
    if (!buf) return null;
    const text = stripAnsi(buf.length > EXIT_TAIL_CHARS ? buf.slice(-EXIT_TAIL_CHARS) : buf);

    const idxNone = text.lastIndexOf(MARK_NONE);
    const idxSingle = text.lastIndexOf(MARK_SINGLE);
    const idxMulti = text.lastIndexOf(MARK_MULTI);

    let win: 'none' | 'single' | 'multi' | null = null;
    let winIdx = -1;
    if (idxNone >= 0 && idxNone >= winIdx) {
        win = 'none';
        winIdx = idxNone;
    }
    if (idxSingle >= 0 && idxSingle > winIdx) {
        win = 'single';
        winIdx = idxSingle;
    }
    if (idxMulti >= 0 && idxMulti > winIdx) {
        win = 'multi';
        winIdx = idxMulti;
    }

    if (win === null || winIdx < 0) return null;

    if (win === 'none') {
        return [];
    }

    if (win === 'single') {
        const sub = text.slice(idxSingle);
        const m = sub.match(new RegExp(`^${MARK_SINGLE}\\s*([a-z]+)\\s*[。．]`));
        if (!m) return null;
        const k = m[1].toLowerCase();
        return KNOWN_EXIT_KEYS.has(k) ? [k] : [];
    }

    const sub = text.slice(idxMulti);
    const multi = sub.match(new RegExp(`^${MARK_MULTI}\\s*([\\s\\S]+?)\\s*[。．]`));
    if (!multi) return null;
    return parseMultiExitInner(multi[1]);
}
