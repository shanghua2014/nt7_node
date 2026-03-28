# nt7_node

浏览器无法直连原始 Telnet 时的 **WebSocket 网关**：接收 `vsmud_vue` 的握手 JSON，建立到 MUD 的 TCP；每条 TCP 下行发送一条 **`vsmud-control` 文本帧**，其中 **`mudText`** 为本段 **TCP 原始字节的 Base64**，并带 **`mudTextEnc":"base64"`**；同帧 **`charset`**（`gb18030` / `utf8`）供前端解码。另有 `prompts` / `exits` / `roomTitle`。不再另发 binary。

## 运行

```bash
npm install
npm start
```

- 监听端口：环境变量 `MUD_GATEWAY_PORT`，默认 **8765**。
- 前端环境变量：`VITE_MUD_GATEWAY=ws://127.0.0.1:8765`（与站点卡片中的游戏地址无关；卡片仍填 MUD 主机与端口）。

## 握手（首条文本帧）

```json
{
  "v": 1,
  "channel": "vsmud-session",
  "connect": {
    "ip": "127.0.0.1",
    "port": "4000",
    "charset": "gb18030",
    "wsPath": "/"
  }
}
```

TCP 就绪后服务端发送：`{"v":1,"channel":"vsmud-session","ready":true}`。失败时发送 `error` 字符串字段。

## 开发

```bash
npm run dev
```

使用 `tsx watch` 热重载。

## 排查「终端无内容」：后端是否在发数据？

1. **网关调试日志**（每条 MUD 下行会打印 `tcpBytes` / `mudTextB64Len` 等）：

   ```bash
   set NT7_GATEWAY_DEBUG=1
   npm start
   ```

   （PowerShell：`$env:NT7_GATEWAY_DEBUG=1`）

2. **不打开浏览器，直接测网关 → MUD**（15 秒内打印收到的 WebSocket 消息）：

   ```bash
   npx tsx src/diag-client.ts 127.0.0.1 4000
   ```

   把 `127.0.0.1` / `4000` 换成站点卡片里的 MUD 地址与端口。若只有一条 JSON 且含 `ready`，之后没有任何 `vsmud-control`，说明 **TCP 连上了但游戏服没有往这条连接里写数据**（或连错端口/被防火墙拦）。

3. 若日志出现 **「丢弃 MUD 下行：浏览器 WebSocket 非 OPEN」**，说明下行到达时浏览器端连接已关或未就绪，需对照前端连接时序。

## 同类提示匹配接入规范（与前端 rematch 配套）

适用场景：前端按钮要求「点击隐藏，后续再次匹配成功再显示」。

后端统一在 `src/mudBridgeDownlinkCore.ts` 的规则表中配置，不要分散在各处手写匹配。

- 通用匹配封装：`src/promptMatchPolicy.ts`
- 当前规则表：`REMATCH_PROMPT_RULES`（如 `cfLv`、`d14`、`baiShi`、`baiWuBo`；`infT` 用整缓冲，不在此表）

### 接入步骤（后端）

1. 在 `mudBridgeDownlinkCore.ts` 定义或复用该提示正则（如 `XXX_PAT`）。
2. 在 `REMATCH_PROMPT_RULES` 增加一条：
   - `xxx: { re: XXX_PAT, policy: 'tail' }`（默认推荐 `tail`）
3. 在 `snapBr` 返回的 `prompts` 中映射：
   - `xxx: rematchPrompt.xxx`
4. 若前端 `BrPr` 尚无该字段，同步补齐类型定义。

### 策略说明

- `policy: 'tail'`：只看缓冲尾部，避免提示命中后长时间粘住（推荐用于 rematch 按钮）。
- `policy: 'full'`：看完整滚动缓冲，适合持续状态类提示。
