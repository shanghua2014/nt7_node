/**
 * WebSocket 网关：浏览器握手后连接 MUD TCP，下行 binary + vsmud-control JSON。
 */
import net from 'node:net';
import { WebSocketServer, WebSocket } from 'ws';

import { mkDlProc, type MudCharset } from './mud-bridge-control.js';

const PORT = Number(process.env.MUD_GATEWAY_PORT || 8765);
const DEBUG = process.env.NT7_GATEWAY_DEBUG === '1' || process.env.NT7_GATEWAY_DEBUG === 'true';

function dbg(...args: unknown[]) {
    if (DEBUG) console.log('[nt7_node]', ...args);
}

type Phase = 'handshake' | 'connecting' | 'live';

type ConnectPayload = {
    ip?: string;
    host?: string;
    port?: string | number;
    charset?: string;
    wsPath?: string;
};

function normCharset(s: string | undefined): MudCharset {
    const c = (s || 'gb18030').toLowerCase();
    if (c === 'utf8' || c === 'utf-8') return 'utf8';
    return 'gb18030';
}

function validatePort(p: string | number | undefined): number | null {
    const n = typeof p === 'string' ? parseInt(p, 10) : Number(p);
    if (!Number.isFinite(n) || n < 1 || n > 65535) return null;
    return n;
}

function sendSessionJson(ws: WebSocket, body: Record<string, unknown>) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ v: 1, channel: 'vsmud-session', ...body }));
    }
}

const wss = new WebSocketServer({ port: PORT });
console.log(`[nt7_node] MUD gateway listening on ws://0.0.0.0:${PORT}`);

wss.on('connection', (ws) => {
    let phase: Phase = 'handshake';
    let tcp: net.Socket | null = null;
    let proc: ReturnType<typeof mkDlProc> | null = null;
    let lastCfLv: boolean | null = null;

    const cleanup = () => {
        if (tcp) {
            tcp.removeAllListeners();
            tcp.destroy();
            tcp = null;
        }
        proc = null;
    };

    ws.on('close', cleanup);
    ws.on('error', cleanup);

    ws.on('message', (data, isBinary) => {
        if (phase === 'live') {
            if (!tcp || tcp.destroyed) return;
            const buf = Buffer.isBuffer(data)
                ? data
                : Buffer.from(data as ArrayBuffer);
            tcp.write(buf);
            return;
        }

        if (phase === 'connecting') {
            if (isBinary && tcp && !tcp.destroyed) {
                const buf = Buffer.isBuffer(data)
                    ? data
                    : Buffer.from(data as ArrayBuffer);
                tcp.write(buf);
            }
            return;
        }

        if (isBinary) {
            ws.close(1008, 'expected handshake json');
            return;
        }

        let msg: unknown;
        try {
            msg = JSON.parse(String(data));
        } catch {
            sendSessionJson(ws, { error: '握手不是合法 JSON' });
            ws.close(1008, 'invalid json');
            return;
        }

        const m = msg as Record<string, unknown>;
        if (m.v !== 1 || m.channel !== 'vsmud-session' || !m.connect || typeof m.connect !== 'object') {
            sendSessionJson(ws, { error: '握手格式无效（需 v=1、channel=vsmud-session、connect）' });
            return;
        }

        const c = m.connect as ConnectPayload;
        const host = String(c.ip ?? c.host ?? '').trim();
        const portNum = validatePort(c.port);
        const charset = normCharset(typeof c.charset === 'string' ? c.charset : undefined);

        if (!host || portNum === null) {
            sendSessionJson(ws, { error: 'connect 中地址或端口无效' });
            return;
        }

        proc = mkDlProc(charset);
        phase = 'connecting';
        dbg('handshake ok → TCP', host, portNum, 'charset=', charset);

        tcp = net.createConnection({ host, port: portNum }, () => {
            phase = 'live';
            dbg('TCP 已连上 MUD，向浏览器发 ready');
            sendSessionJson(ws, { ready: true });
        });

        tcp.on('data', (chunk: Buffer) => {
            if (ws.readyState !== WebSocket.OPEN) {
                console.warn(
                    '[nt7_node] 丢弃 MUD 下行：浏览器 WebSocket 非 OPEN，readyState=',
                    ws.readyState,
                    '（本段',
                    chunk.length,
                    '字节）'
                );
                return;
            }
            try {
                if (!proc) return;
                const ctl = proc.push(chunk);
                const cfLvNow = Boolean(ctl.prompts?.cfLv);
                if (lastCfLv === null || cfLvNow !== lastCfLv) {
                    dbg(
                        'prompts.cfLv changed:',
                        lastCfLv,
                        '->',
                        cfLvNow,
                        'tcpBytes=',
                        chunk.length
                    );
                    lastCfLv = cfLvNow;
                }
                const json = JSON.stringify(ctl);
                ws.send(json);
                dbg(
                    '→ 浏览器 vsmud-control',
                    'jsonBytes=',
                    json.length,
                    'tcpBytes=',
                    chunk.length,
                    'mudTextB64Len=',
                    ctl.mudText?.length ?? 0
                );
            } catch (e) {
                console.error('[nt7_node] vsmud-control 序列化或 push 失败:', e);
            }
        });

        tcp.on('error', (err: NodeJS.ErrnoException) => {
            if (phase !== 'live') {
                sendSessionJson(ws, { error: `连接 MUD 失败: ${err.message}` });
            }
            if (ws.readyState === WebSocket.OPEN) ws.close();
        });

        tcp.on('close', () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
        });
    });
});
