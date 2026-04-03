/**
 * 扁平 BrPr：与 vsmud_vue `common.BrPr` 一致，供终端/菜单逻辑使用。
 * 网关下行已改为分组稀疏 BrPrWire，前端 normalize 后得到本结构。
 */

/** mygiftd 下行元数据，由网关从缓冲解析 */
export interface BrMyGiftTask {
    /** 对应 gift_list 条目的「条件数值」 */
    need: number;
    /** 对应「达成条件」文案 */
    title: string;
}

/** `N、输入指令 … [32m<command> … [2;37;0m`：前端「辅助任务-N」按钮 */
export interface BrAuxTaskFab {
    /** 正则从 `N、输入指令` 提取的序号 */
    n: string;
    /** 从绿字文案提取的命令（如 `map` / `help start`） */
    cmd: string;
}

/** snapBr 内部分组（各字段均有显式布尔值） */
export interface BrPrLoginSnapshot {
    yn: boolean;
    mf: boolean;
    em: boolean;
    chSel: boolean;
    lgPwdL: boolean;
    enNmL: boolean;
    qNew: boolean;
    qDet: boolean;
}

export interface BrPrCardSnapshot {
    xsP: boolean;
    mzP: boolean;
    qmP: boolean;
    psP: boolean;
    pnP: boolean;
    psBoth: boolean;
    pn2: boolean;
}

export interface BrPrGuideSnapshot {
    alh: boolean;
    wash: boolean;
    baiShi: boolean;
    baiWuBo: boolean;
    zhaoCz: boolean;
    zhunCc: boolean;
    cfLv: boolean;
    ky: boolean;
    d14: boolean;
    cEye: boolean;
    lHb: boolean;
}

export interface BrPrSysSnapshot {
    cxPwd: boolean;
    pgM: boolean;
    quitAbd: boolean;
    rcD: boolean;
    reloadPage: boolean;
}

export interface BrPrGroupedSnapshot {
    login: BrPrLoginSnapshot;
    card: BrPrCardSnapshot;
    guide: BrPrGuideSnapshot;
    sys: BrPrSysSnapshot;
    myGiftTask?: BrMyGiftTask;
    auxTaskFab?: BrAuxTaskFab;
    /** 缓冲匹配「用」+ 白字英文名 + 「这个名字将」；前端 `sessionStorage.createUser = 1` */
    createUser?: 1;
}

/**
 * vsmud-control JSON 中的 `prompts`：仅含为 true 的键；整组全 false 则省略该组。
 * 与「旧版扁平全量布尔」并存时由前端 `normalizeBrPrPrompts` 识别。
 */
export interface BrPrWire {
    login?: Partial<BrPrLoginSnapshot>;
    card?: Partial<BrPrCardSnapshot>;
    guide?: Partial<BrPrGuideSnapshot>;
    sys?: Partial<BrPrSysSnapshot>;
    myGiftTask?: BrMyGiftTask;
    auxTaskFab?: BrAuxTaskFab;
    createUser?: 1;
}

export interface BrPr {
    yn: boolean;
    mf: boolean;
    em: boolean;
    chSel: boolean;
    alh: boolean;
    wash: boolean;
    /** 下行拜师提示 */
    baiShi: boolean;
    /** 下行「你先去拜武伯」提示，与拜师同类 rematch */
    baiWuBo: boolean;
    /** 下行 `[2;37;0m武伯决定收你…` 等：菜单「找村长」，rematch（见 vsmud_vue README） */
    zhaoCz: boolean;
    /** 下行「老村长点头」或「你完成了老村长交给你的」：菜单「准备出村」，rematch */
    zhunCc: boolean;
    cfLv: boolean;
    ky: boolean;
    /** `[1;36m1. 直接`：菜单 1～4 数字 */
    d14: boolean;
    cEye: boolean;
    lHb: boolean;
    cxPwd: boolean;
    pgM: boolean;
    quitAbd?: boolean;
    rcD: boolean;
    xsP: boolean;
    mzP: boolean;
    qmP: boolean;
    psP?: boolean;
    pnP?: boolean;
    psBoth?: boolean;
    pn2?: boolean;
    lgPwdL?: boolean;
    enNmL?: boolean;
    qNew?: boolean;
    qDet?: boolean;
    /** 下行含「王者归来(NT.ULTIMATE)启动完毕」本段：前端应整页刷新 */
    reloadPage?: boolean;
    /** 当前辅助任务（mygift）快照：条件数值 + 达成条件标题 */
    myGiftTask?: BrMyGiftTask;
    /** 缓冲匹配 `N、输入指令 … green <command> … [2;37;0m`：按钮「辅助任务-N」发提取命令 */
    auxTaskFab?: BrAuxTaskFab;
    /** 匹配建号英文名提示；前端写入 `sessionStorage.createUser=1` */
    createUser?: 1;
}

export interface BrEx {
    sk: string[] | null;
}

export interface BrRt {
    /** 当前房间短名（状态行解析）；Look 按钮文案 */
    curRoom: string | null;
}
