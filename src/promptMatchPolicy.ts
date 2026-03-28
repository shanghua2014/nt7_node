export type PromptPolicy = 'full' | 'tail';

export interface PromptRule {
    re: RegExp;
    policy?: PromptPolicy;
    tailChars?: number;
}

const DEFAULT_TAIL_CHARS = 320;

function safeTest(re: RegExp, text: string): boolean {
    // 避免 g/y 正则污染 lastIndex
    const flags = re.flags.replace(/g|y/g, '');
    const rg = new RegExp(re.source, flags);
    return rg.test(text);
}

function pickScopeText(bufFull: string, rule: PromptRule): string {
    if ((rule.policy ?? 'full') === 'full') return bufFull;
    const n = rule.tailChars ?? DEFAULT_TAIL_CHARS;
    return bufFull.length > n ? bufFull.slice(-n) : bufFull;
}

export function matchPromptRule(bufFull: string, rule: PromptRule): boolean {
    return safeTest(rule.re, pickScopeText(bufFull, rule));
}

export function matchPromptRules<T extends string>(
    bufFull: string,
    rules: Record<T, PromptRule>
): Record<T, boolean> {
    const out = {} as Record<T, boolean>;
    for (const k of Object.keys(rules) as T[]) {
        out[k] = matchPromptRule(bufFull, rules[k]);
    }
    return out;
}
