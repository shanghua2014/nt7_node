/**
 * 诊断：连本机网关，握手到指定 MUD，打印收到的每条 WebSocket 消息（无需浏览器）。
 * 用法：npx tsx src/diag-client.ts [mudHost] [mudPort]
 * 例：npx tsx src/diag-client.ts 127.0.0.1 4000
 */
import iconv from 'iconv-lite';
import WebSocket from 'ws';

const GW = process.env.NT7_GATEWAY_URL ?? 'ws://127.0.0.1:8765';
const mudHost = process.argv[2] ?? '127.0.0.1';
const mudPort = Number(process.argv[3] ?? '4000');
const charset = (process.argv[4] as 'gb18030' | 'utf8') || 'gb18030';

if (!Number.isFinite(mudPort) || mudPort < 1) {
    console.error('用法: npx tsx src/diag-client.ts <mudHost> <mudPort> [charset]');
    process.exit(1);
}

console.log('网关:', GW, '→ MUD:', mudHost, mudPort, 'charset:', charset);

const ws = new WebSocket(GW);
let n = 0;

ws.on('open', () => {
    ws.send(
        JSON.stringify({
            v: 1,
            channel: 'vsmud-session',
            connect: { ip: mudHost, port: String(mudPort), charset, wsPath: '/' }
        })
    );
    console.log('已发送握手');
});

ws.on('message', (data, isBinary) => {
    n += 1;
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
    const len = buf.length;
    console.log(`#${n} len=${len} binary=${isBinary}`);
    if (!isBinary) {
        const s = buf.toString('utf8');
        const head = s.length > 500 ? `${s.slice(0, 500)}…` : s;
        console.log(head);
        try {
            const j = JSON.parse(s) as {
                channel?: string;
                charset?: string;
                mudText?: string;
                mudTextEnc?: string;
            };
            if (j.channel === 'vsmud-control') {
                const b64Len = j.mudText?.length ?? 0;
                console.log('  [vsmud-control] mudText 字段长度:', b64Len, 'enc=', j.mudTextEnc ?? '(无)');
                if (j.mudTextEnc === 'base64' && j.mudText) {
                    const raw = Buffer.from(j.mudText, 'base64');
                    const cs = j.charset === 'utf8' ? 'utf8' : 'gb18030';
                    const text =
                        cs === 'utf8' ? raw.toString('utf8') : iconv.decode(raw, 'gb18030');
                    console.log('  解码后预览:', JSON.stringify(text.slice(0, 160)));
                }
            }
        } catch {
            /* 非 JSON */
        }
    }
});

ws.on('close', (code, reason) => {
    console.log('WebSocket 关闭', code, reason.toString());
    process.exit(0);
});

ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('15 秒内共收到', n, '条消息；若仅 #1 且无 vsmud-control，说明 MUD 未向 TCP 发任何字节。');
    ws.close();
}, 15_000);
