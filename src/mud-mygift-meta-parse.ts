/**
 * 解析 MUD 下行中 mygiftd 注入的 <<VSMUD_MYGIFT:{"need":n,"title":"…"}>>（见 nt7 adm/daemons/mygiftd.c）。
 */
const MYGIFT_BLOCK = /<<VSMUD_MYGIFT:([\s\S]*?)>>/g;
const TAIL_MAX = 20000;

export type MyGiftTaskMeta = { need: number; title: string };

/**
 * 从本段下行中去掉 mygift 元数据行，再编码为 mudText，避免 xterm 显示。
 * 与 MUD 侧 `ESC[90m<<VSMUD_MYGIFT:…>>` NOR 一致；前后允许换行与其它 SGR。
 */
export function stripVsmudMygiftLine(chunk: string): string {
    return chunk.replace(
        /\r?\n*(?:\x1b\[[0-9;]*m)*<<VSMUD_MYGIFT:[\s\S]*?>>(?:\x1b\[[0-9;]*m)*\r?\n?/g,
        ''
    );
}

export function parseMyGiftTaskMeta(bufFull: string): MyGiftTaskMeta | undefined {
    const tail = bufFull.length > TAIL_MAX ? bufFull.slice(-TAIL_MAX) : bufFull;
    let last: string | undefined;
    for (const m of tail.matchAll(MYGIFT_BLOCK)) {
        last = m[1];
    }
    if (!last?.trim()) return undefined;
    try {
        const o = JSON.parse(last.trim()) as Record<string, unknown>;
        const need = o.need;
        const title = o.title;
        if (typeof need === 'number' && Number.isFinite(need) && typeof title === 'string' && title.length > 0) {
            return { need, title };
        }
    } catch {
        /* ignore */
    }
    return undefined;
}
