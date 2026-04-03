/**
 * MUD 下行匹配与桥接提示快照（仅 nt7_node 后端运行；前端不打包）。
 */
import type { BrAuxTaskFab, BrPrGroupedSnapshot } from './types/brPr.js';
import { matchPromptRules, type PromptRule } from './promptMatchPolicy.js';
import { parseMyGiftTaskMeta } from './mud-mygift-meta-parse.js';

export const ALH_PAT = /(?:\x1b)?\[1;31mask lao/i;
export const ALH_CMD = 'ask lao about here';
export const WASH_PAT = /(?:\x1b)?\[2;37;0m指令格式：washto/i;
export const WASH_CMD = 'washto 20 20 20 20';
/** 拜师：匹配下行红字前缀 `[1;31m要了解`（与 README 口令一致） */
export const BAISHI_PAT = /(?:\x1b)?\[1;31m要了解/;
/** 前端按 `;` 切分后逐条发送 */
export const BAISHI_CMD = 'ask lao about 107;ask lao about ok';
/** 拜武伯：黄字 `[1;33m你先去拜武伯` */
export const BAIWUBO_PAT = /(?:\x1b)?\[1;33m你先去拜武伯/;
/** 前端按 `;` 切分后逐条发送 */
export const BAIWUBO_CMD = 'walk 练武场;bai wubo';
/**
 * 找村长（vsmud_vue README）：`[2;37;0m武伯决定收你`（后可接「为弟子」等，前缀匹配即可）
 */
export const ZHAOCZ_PAT = /(?:\x1b)?\[2;37;0m武伯决定收你/;
/** 无 ANSI 时整缓冲兜底 */
export const ZHAOCZ_PLAIN = /武伯决定收你/;
/** 前端按 `;` 切分后逐条发送 */
export const ZHAOCZ_CMD = 'w;w;ask cunzhang about ok';
/** 准备出村：绿字 `[1;32m老村长点头`（旧） */
export const ZHUNCC_PAT = /(?:\x1b)?\[1;32m老村长点头/;
/** 青字 `[1;36m你完成了老村长交给你的 … ask cunzhang about 出村 准备出村` */
export const ZHUNCC_PAT2 = /(?:\x1b)?\[1;36m你完成了老村长交给你的/;
export const ZHUNCC_PAT2_LOOSE = /(?:\x1b)?\[[0-9;]*m你完成了老村长交给你的/;
export const ZHUNCC_PAT_ANY = new RegExp(
    `(?:${ZHUNCC_PAT.source})|(?:${ZHUNCC_PAT2.source})|(?:${ZHUNCC_PAT2_LOOSE.source})`
);
export const ZHUNCC_PLAIN = /老村长点头|你完成了老村长交给你的/;
/** 前端按 `;` 切分后逐条发送 */
export const ZHUNCC_CMD = 'ask cunzhang about 出村';
/** 确认出村提示；缓冲内可多次命中，前端「确认出村」按钮随下行反复出现 */
export const ASK_HUA_PAT = /(?:\x1b)?\[1;31m\s*ask\s*hua/i;
export const LV_CONFIRM_CMD = 'ask hua about 出村';
export const KY_PAT = /(?:\x1b)?\[1;31m1\.快意恩仇/;
export const KY_PVP_CMD = 'choose 1';
export const KY_PVE_CMD = 'choose 2';
/** 青色系菜单首项「1. 直接」：点按钮发 1～4 */
export const D14_PAT = /(?:\x1b)?\[1;36m1\.\s*直接/;
export const CE_PAT = /closeeye\s*[）)]/i;
export const CE_CMD = 'closeeye';
export const HB_PAT = /(?:\x1b)?\[1;36m老村长嘱咐道：/;
export const HB_CMD = 'walk 村口';
export const QUIT_ABANDON_PAT = /(?:\x1b)?\[1;37m您选择了放弃该账号/;
/**
 * 白字「您选择了放…」（如放弃流程）；与 NT 启动完毕同类，触发前端整页刷新。
 * 仅用本 TCP 段 `decodedChunk` 匹配，避免整缓冲长期命中。
 */
export const RELOAD_PAGE_CHOOSE_FANG_PAT = /(?:\x1b)?\[1;37m您选择了放/;
/** 王者归来主程序启动完毕；仅本 TCP 段匹配（见 snapBr reloadPage），避免整缓冲长期命中反复刷新 */
const NT_BOOT_GAP = '(?:\\x1b\\[[0-9;]*m|\\s)*';
export const NT_ULTIMATE_BOOT_PAT = new RegExp(
    `雪海飘香${NT_BOOT_GAP}\\(${NT_BOOT_GAP}NT\\.ULTIMATE${NT_BOOT_GAP}\\)${NT_BOOT_GAP}启动完毕`
);

const CX_BUF0 = '^(?:\\x1b\\[[0-9;]*m)*这个角色已经存在[，,]';
const CX_NL = '(?:\\r\\n|\\r|\\n)(?:\\x1b\\[[0-9;]*m)*这个角色已经存在[，,]';
export const CX_PAT = new RegExp(`${CX_BUF0}|${CX_NL}`);
export const PG_UNF_PAT = /(?:\x1b)?\[[0-9;]*37m==\s*未完/;
export const PG_TAIL = 2048;
export const PG_LINES = 6;
export const RC_PAT = /(?:\x1b)?\[K重新连线完毕[。]?/;
export const LG_PWD_PAT = /(请输入密码)|(\bpassword\b)/i;
export const EN_NM_PAT = /((你|您)的英文名)|(\bname\b)/i;
export const Q_NEW_PAT = /(人物请输入new。)|(\bnew\b)/i;
export const Q_DET_PAT = /(即将开始检测你的客户端)|(detect)/i;

/**
 * `用` + `[1;37m` + 英文名校验 + `[2;37;0m这个名字将`（英文名 `[A-Za-z]+`）
 */
export const CREATE_USER_NAME_PAT =
    /用(?:\x1b)?\[1;37m([A-Za-z]+)(?:\x1b)?\[2;37;0m这个名字将/;

/**
 * `N、输入指令 … [32m<command> … [2;37;0m`
 * - N 前后可有英文前后缀
 * - command 支持单词或双词（如 `map` / `help start`）
 */
export const AUX_TASK_HELP_START_RE =
    /】：[A-Za-z]*(\d+)[A-Za-z]*、输入指令[\s\S]{0,600}?(?:\x1b)?\[[0-9;]*32m([a-z]+(?:\s+[a-z]+)?)[\s\S]{0,50}?(?:\x1b)?\[2;37;0m/i;

export function parseAuxTaskHelpStartFab(bufFull: string): BrAuxTaskFab | undefined {
    const m = bufFull.match(AUX_TASK_HELP_START_RE);
    if (!m?.[1] || !m?.[2]) return undefined;
    return { n: m[1], cmd: m[2].trim().toLowerCase() };
}

const XS_PAT = /(?:\x1b)?\[1;32m姓氏/;
const MZ_PAT = /(?:\x1b)?\[1;33m名字/;
const QM_PAT = /(?:\x1b)?\[2;37;0m请输入您的全名\(/;
const PS_1 = /(?:\x1b)?\[1;33m管理密码/;
const PN_1 = /(?:\x1b)?\[1;37m普通密码/;
/**
 * 需要“再次匹配触发”的提示统一走规则表，后续新增同类按钮只需加一行配置。
 */
const REMATCH_PROMPT_RULES: Record<
    'cfLv' | 'd14' | 'baiShi' | 'baiWuBo' | 'zhaoCz' | 'zhunCc',
    PromptRule
> = {
    cfLv: { re: ASK_HUA_PAT, policy: 'tail' },
    d14: { re: D14_PAT, policy: 'tail' },
    baiShi: { re: BAISHI_PAT, policy: 'tail' },
    baiWuBo: { re: BAIWUBO_PAT, policy: 'tail' },
    zhaoCz: { re: ZHAOCZ_PAT, policy: 'full' },
    /** 与 zhaoCz 同类：叙事句后常跟大段描述，勿仅用 tail 窗 */
    zhunCc: { re: ZHUNCC_PAT_ANY, policy: 'full' }
};

const CARD_ORD = [
    { re: QM_PAT, key: 'qmP' as const },
    { re: MZ_PAT, key: 'mzP' as const },
    { re: XS_PAT, key: 'xsP' as const }
] as const;

type CardKey = (typeof CARD_ORD)[number]['key'] | 'psP' | 'pnP';
type CardFlags = Record<CardKey, boolean>;

const CARD_NONE: CardFlags = {
    xsP: false,
    mzP: false,
    qmP: false,
    psP: false,
    pnP: false
};

function lastIdx(re: RegExp, s: string): number {
    const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
    const rg = new RegExp(re.source, flags);
    let last = -1;
    for (const m of s.matchAll(rg)) {
        if (m.index !== undefined) last = m.index;
    }
    return last;
}

function resolveCard(bufFull: string): CardFlags {
    const scored: { key: CardKey; i: number }[] = CARD_ORD.map((d) => ({
        key: d.key,
        i: lastIdx(d.re, bufFull)
    }));
    const iPs = Math.max(
        lastIdx(PS_1, bufFull),
        lastIdx(/(?:\x1b)?\[1;33;0m请再输入一次您的管/, bufFull)
    );
    scored.push({ key: 'psP', i: iPs });
    const iPn = Math.max(
        lastIdx(PN_1, bufFull),
        lastIdx(/(?:\x1b)?\[1;37;0m请再输入一次您的普/, bufFull)
    );
    scored.push({ key: 'pnP', i: iPn });
    const max = Math.max(-1, ...scored.map((x) => x.i));
    if (max < 0) return { ...CARD_NONE };
    const win = scored.find((x) => x.i === max)!;
    return { ...CARD_NONE, [win.key]: true };
}

function pn2Ready(bufFull: string): boolean {
    const i1 = lastIdx(PN_1, bufFull);
    const i2 = lastIdx(/(?:\x1b)?\[1;37;0m请再输入一次您的普/, bufFull);
    if (i2 < 0) return false;
    return i1 < 0 || i2 > i1;
}

export function ynOk(chunk: string): boolean {
    const ansi = '(?:\\x1b\\[[0-9;]*m)*';
    const ynWithAnsi = new RegExp(
        `[(（]${ansi}y${ansi}\\/${ansi}n${ansi}[)）]|${ansi}y${ansi}\\/${ansi}n`,
        'i'
    );
    return ynWithAnsi.test(chunk);
}

/** 性别：绿 `[1;32m` + `m` 为男，洋红 `[1;35m` + `f` 为女（可与无 ESC 的裸 `[` 形式并存） */
const MF_M_PAT = /(?:\x1b)?\[1;32mm/;
const MF_F_PAT = /(?:\x1b)?\[1;35mf/;

export function mfOk(chunk: string): boolean {
    return MF_M_PAT.test(chunk) || MF_F_PAT.test(chunk);
}

/** 注册 Email 提示：与 nt7_utf8 regroom `HIW " reg …"`（`[1;37m reg`）一致；前端 `BrPr.em` 为真时显示 Email 按钮 */
export const EM_PAT = /(?:\x1b)?\[1;37m\s+reg\b/;
export function emOk(buf: string): boolean {
    return EM_PAT.test(buf);
}

export function chSelOk(buf: string): boolean {
    return /(?:\x1b)?\[2;37;0m您可以选择\(choose/i.test(buf);
}

function pgTailOk(raw: string): boolean {
    if (!raw) return false;
    const slice = raw.length > PG_TAIL ? raw.slice(-PG_TAIL) : raw;
    const lines = slice.split(/\r?\n/);
    const lastFew = lines.slice(-PG_LINES).join('\n');
    return PG_UNF_PAT.test(lastFew);
}

export function mCx(raw: string): boolean {
    return CX_PAT.test(raw);
}

export function mRc(raw: string): boolean {
    return RC_PAT.test(raw);
}

/** 仅在此尾部窗口内匹配登录提示，避免整缓冲里「最早一次」密码提示在 MOTD/进房后仍占位导致 lgPwdL 恒真 */
const LOGIN_PROMPT_TAIL = 32000;

function bufTailForLoginPrompts(bufFull: string): string {
    return bufFull.length > LOGIN_PROMPT_TAIL ? bufFull.slice(-LOGIN_PROMPT_TAIL) : bufFull;
}

/**
 * 登录/建号相关提示若在「仅 MOTD 等大段」的 TCP 包中，decodedChunk 不含提示行会导致全 false，
 * 菜单区（Email、发送 new、自动上行账号等）被错误关闭。按 bufFull 内最后一次出现的提示判定当前阶段。
 */
function loginPromptFlags(
    decodedChunk: string,
    bufFull: string
): { lgPwdL: boolean; enNmL: boolean; qNew: boolean; qDet: boolean } {
    const yn = ynOk(decodedChunk);
    const mf = mfOk(bufFull);
    if (yn || mf) {
        return { lgPwdL: false, enNmL: false, qNew: false, qDet: false };
    }
    const tail = bufTailForLoginPrompts(bufFull);
    const iPwd = lastIdx(LG_PWD_PAT, tail);
    const iEn = lastIdx(EN_NM_PAT, tail);
    const iNew = lastIdx(Q_NEW_PAT, tail);
    const iDet = lastIdx(Q_DET_PAT, tail);
    const max = Math.max(-1, iPwd, iEn, iNew, iDet);
    return {
        lgPwdL: max === iPwd && iPwd >= 0,
        enNmL: max === iEn && iEn >= 0,
        qNew: max === iNew && iNew >= 0,
        qDet: max === iDet && iDet >= 0
    };
}

export function snapBr(decodedChunk: string, bufFull: string): BrPrGroupedSnapshot {
    const yn = ynOk(decodedChunk);
    const mf = mfOk(bufFull);
    const card = resolveCard(bufFull);
    const psBoth =
        PS_1.test(bufFull) &&
        /(?:\x1b)?\[1;33;0m请再输入一次您的管/.test(bufFull);
    const pn2 = pn2Ready(bufFull);

    const { lgPwdL, enNmL, qNew, qDet } = loginPromptFlags(decodedChunk, bufFull);
    const rematchPrompt = matchPromptRules(bufFull, REMATCH_PROMPT_RULES);
    /** 本段含 NT 启动完毕或「您选择了放…」时为 true，供前端整页刷新 */
    const reloadPage =
        NT_ULTIMATE_BOOT_PAT.test(decodedChunk) || RELOAD_PAGE_CHOOSE_FANG_PAT.test(decodedChunk);
    const myGiftTask = parseMyGiftTaskMeta(bufFull);
    const auxTaskFab = parseAuxTaskHelpStartFab(bufFull);

    const em = emOk(bufFull);
    const chSel = chSelOk(bufFull);
    return {
        login: {
            yn,
            mf,
            em,
            chSel,
            lgPwdL,
            enNmL,
            qNew,
            qDet
        },
        card: {
            xsP: card.xsP,
            mzP: card.mzP,
            qmP: card.qmP,
            psP: card.psP,
            pnP: card.pnP,
            psBoth,
            pn2
        },
        guide: {
            alh: ALH_PAT.test(bufFull),
            wash: WASH_PAT.test(bufFull),
            baiShi: rematchPrompt.baiShi,
            baiWuBo: rematchPrompt.baiWuBo,
            zhaoCz: rematchPrompt.zhaoCz || ZHAOCZ_PLAIN.test(bufFull),
            zhunCc: rematchPrompt.zhunCc || ZHUNCC_PLAIN.test(bufFull),
            cfLv: rematchPrompt.cfLv,
            ky: KY_PAT.test(bufFull),
            d14: rematchPrompt.d14,
            cEye: CE_PAT.test(bufFull),
            lHb: HB_PAT.test(bufFull)
        },
        sys: {
            cxPwd: mCx(bufFull),
            pgM: pgTailOk(bufFull),
            quitAbd: QUIT_ABANDON_PAT.test(bufFull),
            rcD: mRc(bufFull),
            reloadPage
        },
        ...(myGiftTask ? { myGiftTask } : {}),
        ...(auxTaskFab ? { auxTaskFab } : {}),
        ...(CREATE_USER_NAME_PAT.test(bufFull) ? { createUser: 1 as const } : {})
    };
}
