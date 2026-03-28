/** 与 vsmud_vue 前端 common.BrPr 字段一致，供 vsmud-control JSON 使用 */

export interface BrPr {
    yn: boolean;
    mf: boolean;
    em: boolean;
    chSel: boolean;
    alh: boolean;
    wash: boolean;
    infT: boolean;
    /** 与「信息」同列显示逻辑：下行拜师提示 */
    baiShi: boolean;
    /** 下行「你先去拜武伯」提示，与拜师同类 rematch */
    baiWuBo: boolean;
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
}

export interface BrEx {
    sk: string[] | null;
}

export interface BrRt {
    nm: string | null;
}
