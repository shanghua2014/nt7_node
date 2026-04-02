/** 与 vsmud_vue 前端 common.BrPr 字段一致，供 vsmud-control JSON 使用 */

/** mygiftd 下行元数据，由网关从缓冲解析 */
export interface BrMyGiftTask {
    /** 对应 gift_list 条目的「条件数值」 */
    need: number;
    /** 对应「达成条件」文案 */
    title: string;
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
}

export interface BrEx {
    sk: string[] | null;
}

export interface BrRt {
    nm: string | null;
}
