/**
 * 每条 TCP 下行后生成 vsmud-control JSON（与 vsmud_vue 前端约定一致）。
 */
import type { BrPrWire } from './types/brPr.js';
import { pruneBrPrForWire } from './mud-br-pr-wire.js';
import { snapBr } from './mudBridgeDownlinkCore.js';
import { parseExitDirsFromMudBuffer } from './mud-exit-dirs-parse.js';
import { parseCurrentRoomNameFromMudBuffer } from './mud-room-title-parse.js';
import { stripVsmudMygiftLine } from './mud-mygift-meta-parse.js';
import { createVsmudOscStripper } from './mud-vsmud-osc-strip.js';

/** 过小会把较早的登录/register 行裁掉，em 等变 false；略增大以覆盖 MOTD+大房间描述 */
const BUF_MAX = 500_000;

function decChunk(buf: Buffer): string {
    return buf.toString('utf8');
}

function encChunk(s: string): Buffer {
    return Buffer.from(s, 'utf8');
}

export interface BrCtlPayload {
    v: 1;
    channel: 'vsmud-control';
    /** 固定 UTF-8 */
    charset: 'utf8';
    /** 固定为 base64，与 `mudText` 成对出现 */
    mudTextEnc: 'base64';
    /** 本 TCP 段经 UTF-8 解码、剔除 VSMUD_MYGIFT 行后再编码的 Base64，供终端展示 */
    mudText: string;
    exits: { sk: string[] | null };
    roomTitle: { curRoom: string | null };
    prompts: BrPrWire;
}

export function mkDlProc() {
    let rawBuf = '';
    const oscStrip = createVsmudOscStripper();

    return {
        push(buf: Buffer): BrCtlPayload {
            const decoded = decChunk(buf);
            rawBuf = (rawBuf + decoded).slice(-BUF_MAX);
            const bufFull = rawBuf;
            const strippedGift = stripVsmudMygiftLine(decoded);
            const displayDecoded = oscStrip.push(strippedGift);

            return {
                v: 1,
                channel: 'vsmud-control',
                charset: 'utf8',
                mudTextEnc: 'base64',
                mudText: encChunk(displayDecoded).toString('base64'),
                exits: { sk: parseExitDirsFromMudBuffer(bufFull) },
                roomTitle: { curRoom: parseCurrentRoomNameFromMudBuffer(bufFull) },
                prompts: pruneBrPrForWire(snapBr(decoded, bufFull))
            };
        },

        reset(): void {
            rawBuf = '';
            oscStrip.reset();
        }
    };
}
