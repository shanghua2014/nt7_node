/**
 * 剔除 MUD 下发的静默 OSC `\x1b]777;vsmud;motd_done\x07`，避免进 xterm。
 * TCP 可能拆包，须跨 chunk 保留尾部再匹配。
 */
const VSMUD_OSC_SEQ = '\x1b]777;vsmud;motd_done\x07';
const VSMUD_OSC_RE = /\x1b\]777;vsmud;motd_done\x07/g;

export type VsmudOscStripper = {
    push(chunk: string): string;
    reset(): void;
};

export function createVsmudOscStripper(): VsmudOscStripper {
    let carry = '';
    return {
        push(chunk: string): string {
            let s = carry + chunk;
            carry = '';
            s = s.replace(VSMUD_OSC_RE, '');
            const sig = VSMUD_OSC_SEQ;
            for (let i = sig.length - 1; i >= 2; i--) {
                const pref = sig.slice(0, i);
                if (s.endsWith(pref)) {
                    carry = pref;
                    s = s.slice(0, -i);
                    break;
                }
            }
            return s;
        },
        reset(): void {
            carry = '';
        }
    };
}
