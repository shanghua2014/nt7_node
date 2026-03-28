/**
 * 从下行缓冲解析状态行房间名。
 *
 * 形态一：[1;36m青石大道[2;37;0m - (你目前在
 * 形态二：[256D[K[1;36m武庙[2;37;0m
 */
const TAIL_CHARS = 12000;

export const ROOM_TITLE_PATTERN =
    /(?:\x1b)?\[1;36m([^\x1b]+?)(?:\x1b)?\[2;37(?:;0)?m\s*-\s*[\(（]\s*你目前在/g;

export const ROOM_TITLE_PATTERN_AFTER_256DK =
    /(?:\x1b)?\[256D(?:\x1b)?\[K(?:\x1b)?\[1;36m([^\x1b]+?)(?:\x1b)?\[2;37(?:;0)?m/g;

const TITLE_PATTERNS = [ROOM_TITLE_PATTERN, ROOM_TITLE_PATTERN_AFTER_256DK];

function normalizeRoomName(capture: string): string {
    return capture.replace(/\x1b\[[0-9;]*m/g, '').trim();
}

export function parseCurrentRoomNameFromMudBuffer(buf: string): string | null {
    if (!buf) return null;
    const slice = buf.length > TAIL_CHARS ? buf.slice(-TAIL_CHARS) : buf;
    let bestName: string | null = null;
    let bestIndex = -1;
    for (const pattern of TITLE_PATTERNS) {
        const re = new RegExp(
            pattern.source,
            pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
        );
        let m: RegExpExecArray | null;
        while ((m = re.exec(slice)) !== null) {
            const name = normalizeRoomName(m[1]);
            if (name && m.index >= bestIndex) {
                bestIndex = m.index;
                bestName = name;
            }
        }
    }
    return bestName;
}
