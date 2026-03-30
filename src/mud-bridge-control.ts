/**
 * 每条 TCP 下行后生成 vsmud-control JSON（与 vsmud_vue 前端约定一致）。
 */
import iconv from 'iconv-lite';

import type { BrPr } from './types/brPr.js';
import { snapBr } from './mudBridgeDownlinkCore.js';
import { parseExitDirsFromMudBuffer } from './mud-exit-dirs-parse.js';
import { parseCurrentRoomNameFromMudBuffer } from './mud-room-title-parse.js';

export type MudCharset = 'gb18030' | 'utf8';

/** 过小会把较早的任务提示裁掉，导致 snapBr（如 zhaoCz）长期为 false */
const BUF_MAX = 100_000;

function decChunk(buf: Buffer, charset: MudCharset): string {
    if (charset === 'utf8') return buf.toString('utf8');
    return iconv.decode(buf, 'gb18030');
}

export interface BrCtlPayload {
    v: 1;
    channel: 'vsmud-control';
    charset: MudCharset;
    /** 固定为 base64，与 `mudText` 成对出现 */
    mudTextEnc: 'base64';
    /** 本 TCP 段原始字节的 Base64，前端用 `charset` 解码 */
    mudText: string;
    exits: { sk: string[] | null };
    roomTitle: { nm: string | null };
    prompts: BrPr;
}

export function mkDlProc(charset: MudCharset = 'gb18030') {
    let rawBuf = '';

    return {
        push(buf: Buffer): BrCtlPayload {
            const decoded = decChunk(buf, charset);
            rawBuf = (rawBuf + decoded).slice(-BUF_MAX);
            const bufFull = rawBuf;

            return {
                v: 1,
                channel: 'vsmud-control',
                charset,
                mudTextEnc: 'base64',
                mudText: buf.toString('base64'),
                exits: { sk: parseExitDirsFromMudBuffer(bufFull) },
                roomTitle: { nm: parseCurrentRoomNameFromMudBuffer(bufFull) },
                prompts: snapBr(decoded, bufFull)
            };
        },

        reset(): void {
            rawBuf = '';
        }
    };
}
