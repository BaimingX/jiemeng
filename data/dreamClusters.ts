import { DreamClusterSlug, DreamTopic, getTopicsByCluster } from './dreamTopics';

export interface DreamClusterInfo {
    slug: DreamClusterSlug;
    titleEn: string;
    titleZh: string;
    descriptionEn: string;
    descriptionZh: string;
    introEn: string[];
    introZh: string[];
    signalsEn: string[];
    signalsZh: string[];
    checklistEn: string[];
    checklistZh: string[];
}

export const dreamClusters: DreamClusterInfo[] = [
    {
        slug: 'anxiety',
        titleEn: 'Anxiety Dreams',
        titleZh: '焦虑类梦境',
        descriptionEn: 'Interpret dream patterns linked to stress, pressure, control, and social anxiety.',
        descriptionZh: '聚焦压力、控制感、时间焦虑与社交不安相关梦境。',
        introEn: [
            'Anxiety dreams often show up when your nervous system is overloaded by uncertainty, deadlines, or self-pressure.',
            'The goal is not to force a perfect meaning, but to identify repeat patterns and reduce emotional load in waking life.'
        ],
        introZh: [
            '焦虑类梦境常出现在不确定性、截止日期或自我压力持续累积时。',
            '重点不是追求唯一答案，而是识别重复模式，并在现实中降低负荷。'
        ],
        signalsEn: [
            'Frequent urgency themes: running late, missing transport, exam panic.',
            'Body-image and social-exposure themes: teeth, hair, being judged in public.',
            'Control-loss scenarios: falling, crashes, repeated near-failure situations.'
        ],
        signalsZh: [
            '常见紧迫主题：迟到、错过交通、考试恐慌。',
            '常见暴露主题：牙齿、脱发、当众被评价。',
            '常见失控场景：坠落、碰撞、反复“差点失败”的体验。'
        ],
        checklistEn: [
            'Reduce one avoidable deadline this week.',
            'Protect a fixed recovery block in your calendar.',
            'Convert one vague fear into a concrete next action.'
        ],
        checklistZh: [
            '本周先减少一个可避免的硬截止。',
            '在日程里固定一段恢复时间。',
            '把一个模糊焦虑改写成可执行下一步。'
        ]
    },
    {
        slug: 'relationship',
        titleEn: 'Relationship Dreams',
        titleZh: '关系类梦境',
        descriptionEn: 'Decode relationship themes such as trust, attachment, commitment, and emotional distance.',
        descriptionZh: '解读信任、依恋、承诺与情感距离相关梦境。',
        introEn: [
            'Relationship dreams usually reflect emotional dynamics rather than literal predictions about another person.',
            'They are useful when paired with communication patterns, boundaries, and your current emotional needs.'
        ],
        introZh: [
            '关系类梦境通常反映的是情绪动力，而非对他人的字面预言。',
            '结合沟通模式、边界状态与当下需求来解读会更有效。'
        ],
        signalsEn: [
            'Recurring ex-partner dreams during transition periods.',
            'Commitment dreams: weddings, babies, family-role pressure.',
            'Trust rupture themes: cheating, abandonment, feeling unseen.'
        ],
        signalsZh: [
            '在转型期反复梦到前任。',
            '承诺主题：婚礼、婴儿、家庭角色压力。',
            '信任破裂主题：出轨、被抛下、被忽视感。'
        ],
        checklistEn: [
            'Name one unmet relationship need clearly.',
            'Schedule one direct but calm conversation.',
            'Define one boundary and one repair action.'
        ],
        checklistZh: [
            '明确写下一个未被满足的关系需求。',
            '安排一次直接但平静的沟通。',
            '同时设定一条边界和一个修复动作。'
        ]
    },
    {
        slug: 'nightmare',
        titleEn: 'Nightmare Patterns',
        titleZh: '噩梦模式',
        descriptionEn: 'Understand recurring nightmare themes and convert them into practical recovery steps.',
        descriptionZh: '理解反复噩梦主题，并转化为可执行的恢复步骤。',
        introEn: [
            'Nightmares are often stress-amplified simulations, not guarantees that something bad will happen.',
            'Pattern tracking, sleep hygiene, and emotional processing can reduce intensity over time.'
        ],
        introZh: [
            '噩梦通常是压力放大后的模拟，不代表坏事一定会发生。',
            '通过模式记录、睡眠习惯优化和情绪处理，强度通常会下降。'
        ],
        signalsEn: [
            'Threat-and-chase loops with no resolution.',
            'Disaster imagery: crashes, fire, storms, collapse.',
            'Past-memory intrusions: ghost-like or unresolved fear scenes.'
        ],
        signalsZh: [
            '反复威胁与追逐，但始终无法解决。',
            '灾难画面：碰撞、火灾、风暴、坍塌。',
            '过去记忆侵入：鬼魂式、未完成恐惧场景。'
        ],
        checklistEn: [
            'Record the nightmare within 5 minutes after waking.',
            'Map one daytime trigger connected to the dream.',
            'Use a short wind-down routine before sleep for seven days.'
        ],
        checklistZh: [
            '醒来 5 分钟内记录噩梦关键画面。',
            '找到一个与梦境对应的白天触发点。',
            '连续 7 天执行简短睡前放松流程。'
        ]
    },
    {
        slug: 'growth',
        titleEn: 'Growth and Transition Dreams',
        titleZh: '成长与转变类梦境',
        descriptionEn: 'Explore symbols linked to identity shifts, personal growth, and life transitions.',
        descriptionZh: '解读与身份转变、个人成长和生活阶段变化相关的梦境符号。',
        introEn: [
            'Growth dreams often appear when you are leaving one identity and building another.',
            'They are less about immediate danger and more about adaptation, direction, and confidence rebuilding.'
        ],
        introZh: [
            '当你正在离开旧身份、走向新阶段时，成长类梦境很常见。',
            '这类梦的重点往往不是立即危险，而是适应力、方向感和信心重建。'
        ],
        signalsEn: [
            'Rebirth symbols: snakes, water, death, pregnancy, and seasonal transitions.',
            'Identity-space metaphors: houses, unknown rooms, changing doors, moving cities.',
            'Freedom versus control themes: flying, waves, navigation, and uncertain roads.'
        ],
        signalsZh: [
            '重生符号：蛇、水、死亡、怀孕以及季节变化。',
            '身份空间隐喻：房子、未知房间、门的变化、迁移场景。',
            '自由与掌控并存主题：飞行、浪潮、导航与不确定路径。'
        ],
        checklistEn: [
            'Name one old role you are outgrowing this month.',
            'Choose one capability for the next stage and schedule focused practice.',
            'Review weekly using dream frequency and emotional stability as trend signals.'
        ],
        checklistZh: [
            '写下本月你正在走出的一个旧角色。',
            '为下一阶段选定一项核心能力，并安排练习时间。',
            '每周用“梦境频率 + 情绪稳定度”作为趋势复盘指标。'
        ]
    }
];

export const dreamClusterBySlug = (slug?: string) =>
    dreamClusters.find((cluster) => cluster.slug === slug);

export const getClusterTopics = (clusterSlug: DreamClusterSlug): DreamTopic[] =>
    getTopicsByCluster(clusterSlug);
