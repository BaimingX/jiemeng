export interface MarketInfo {
    slug: string;
    nameEn: string;
    nameZh: string;
    summaryEn: string;
    summaryZh: string;
    audienceEn: string[];
    audienceZh: string[];
    platformsEn: string[];
    platformsZh: string[];
    anglesEn: string[];
    anglesZh: string[];
    contentEn: string[];
    contentZh: string[];
}

export const markets: MarketInfo[] = [
    {
        slug: 'us',
        nameEn: 'United States',
        nameZh: '美国',
        summaryEn: 'Largest English-speaking market with strong interest in self-help and psychology apps. High willingness to pay on iOS.',
        summaryZh: '英语市场最大，对自我成长与心理类应用兴趣强，iOS 付费意愿高。',
        audienceEn: [
            '18-45, wellness and self-improvement focused.',
            'High sensitivity to privacy and data use.'
        ],
        audienceZh: [
            '18-45 岁，对身心健康与自我成长关注度高。',
            '注重隐私与数据使用透明度。'
        ],
        platformsEn: [
            'iOS skewed, higher subscription spend.',
            'Android still large volume, optimize both stores.'
        ],
        platformsZh: [
            'iOS 占比更高，订阅付费更强。',
            'Android 体量大，需双端优化。'
        ],
        anglesEn: [
            'AI dream journal + modern therapy tone.',
            'Privacy-first positioning with clear safeguards.'
        ],
        anglesZh: [
            'AI 梦境日记 + 现代心理视角。',
            '强调隐私与数据保护。'
        ],
        contentEn: [
            'Work stress dreams, nightmares, and seasonal spikes (Halloween).',
            'Common themes like teeth falling out and being chased.'
        ],
        contentZh: [
            '工作压力、噩梦与季节性话题（如万圣节）。',
            '牙齿脱落、被追逐等高频主题。'
        ]
    },
    {
        slug: 'uk',
        nameEn: 'United Kingdom',
        nameZh: '英国',
        summaryEn: 'Strong interest in dream meanings with balanced iOS/Android usage. Trust and credibility matter.',
        summaryZh: '对梦境含义关注度高，iOS/Android 相对均衡，强调可信度。',
        audienceEn: [
            '18-45, interest in psychology and spiritual angles.',
            'Media frequently covers dream meanings.'
        ],
        audienceZh: [
            '18-45 岁，兼顾心理与灵性视角。',
            '媒体常讨论梦境含义。'
        ],
        platformsEn: [
            'Roughly 50/50 iOS and Android.',
            'Localize with UK spelling where relevant.'
        ],
        platformsZh: [
            'iOS 与 Android 接近 50/50。',
            '文案可适配英式拼写。'
        ],
        anglesEn: [
            'Evidence-based framing with a calm tone.',
            'Highlight expert or research-backed insights.'
        ],
        anglesZh: [
            '强调科学视角与温和语气。',
            '突出研究或专家背书。'
        ],
        contentEn: [
            'Teeth falling out is the top query.',
            'Snakes, hair, and pregnancy themes.'
        ],
        contentZh: [
            '牙齿脱落为最高频主题。',
            '蛇、头发、怀孕等主题。'
        ]
    },
    {
        slug: 'ca',
        nameEn: 'Canada',
        nameZh: '加拿大',
        summaryEn: 'Smaller but high-value market similar to the US. Privacy and wellness messaging performs well.',
        summaryZh: '规模较小但付费能力好，与美国相似，隐私与健康叙事有效。',
        audienceEn: [
            'Wellness and mental health oriented users.',
            'English-first with potential for bilingual expansion.'
        ],
        audienceZh: [
            '关注健康与心理的用户。',
            '以英语为主，可后续考虑双语。'
        ],
        platformsEn: [
            'High iOS adoption with strong monetization.',
            'Android still sizable volume.'
        ],
        platformsZh: [
            'iOS 占比高，变现强。',
            'Android 仍有可观体量。'
        ],
        anglesEn: [
            'Self-reflection and stress relief angle.',
            'Highlight privacy compliance.'
        ],
        anglesZh: [
            '强调自我反思与减压。',
            '突出隐私合规。'
        ],
        contentEn: [
            'Dream meaning around stress and relationships.',
            'Recurring dreams and symbolism glossaries.'
        ],
        contentZh: [
            '压力与关系相关梦境含义。',
            '反复梦与符号词典。'
        ]
    },
    {
        slug: 'au',
        nameEn: 'Australia',
        nameZh: '澳大利亚',
        summaryEn: 'High smartphone penetration with strong monetization potential. Casual, friendly tone works well.',
        summaryZh: '手机普及率高，订阅潜力强，语气偏轻松友好。',
        audienceEn: [
            'Young adults into mindfulness and wellness.',
            'Open to spiritual or reflective content.'
        ],
        audienceZh: [
            '偏年轻用户，关注冥想与身心健康。',
            '接受灵性或自省内容。'
        ],
        platformsEn: [
            'Balanced iOS/Android usage.',
            'App Store revenue per user is high.'
        ],
        platformsZh: [
            'iOS 与 Android 较为均衡。',
            'App Store 人均收入高。'
        ],
        anglesEn: [
            'Friendly, approachable copy.',
            'Position as fun but insightful.'
        ],
        anglesZh: [
            '语气友好轻松。',
            '强调有趣又有洞见。'
        ],
        contentEn: [
            'Work-life balance dreams.',
            'Common symbols like falling or flying.'
        ],
        contentZh: [
            '工作与生活平衡相关梦境。',
            '坠落、飞行等通用符号。'
        ]
    },
    {
        slug: 'in',
        nameEn: 'India',
        nameZh: '印度',
        summaryEn: 'Large English-speaking audience with strong Android dominance. Growth-first approach recommended.',
        summaryZh: '英语用户规模大，Android 占绝对主导，建议增长优先策略。',
        audienceEn: [
            'Younger demographic with mobile-first habits.',
            'Interest in cultural dream symbolism.'
        ],
        audienceZh: [
            '人群更年轻，移动端优先。',
            '对文化解梦有兴趣。'
        ],
        platformsEn: [
            'Android-first distribution and optimization.',
            'Lightweight experience for varying networks.'
        ],
        platformsZh: [
            'Android 优先分发与优化。',
            '适配网络与设备差异。'
        ],
        anglesEn: [
            'Emphasize free access or longer trials.',
            'Highlight privacy and cultural inclusivity.'
        ],
        anglesZh: [
            '强调免费/更长试用。',
            '强调隐私与文化包容。'
        ],
        contentEn: [
            'Snake dreams are highly searched.',
            'Localized landing content can boost adoption.'
        ],
        contentZh: [
            '蛇梦搜索量高。',
            '适度本地化内容有助于增长。'
        ]
    },
    {
        slug: 'ph',
        nameEn: 'Philippines',
        nameZh: '菲律宾',
        summaryEn: 'Social-media-first English market with strong mobile engagement. Viral sharing can drive growth.',
        summaryZh: '社交媒体驱动的英语市场，移动端活跃度高，易形成传播。',
        audienceEn: [
            'Young, mobile-first users with high social usage.',
            'English-friendly audience open to wellness content.'
        ],
        audienceZh: [
            '年轻用户为主，移动端与社交使用频繁。',
            '英语接受度高，愿意尝试身心健康内容。'
        ],
        platformsEn: [
            'Android-dominant, optimize for data efficiency.',
            'iOS smaller but higher spending.'
        ],
        platformsZh: [
            'Android 占主导，注意流量与性能优化。',
            'iOS 规模较小但付费更高。'
        ],
        anglesEn: [
            'Short, shareable dream insights for social channels.',
            'Freemium onboarding with gentle upgrades.'
        ],
        anglesZh: [
            '适配社媒传播的短内容梦境洞见。',
            '免费体验 + 温和转化。'
        ],
        contentEn: [
            'Teeth falling out, snakes, and relationship themes.',
            'Dream recall tips and quick symbol guides.'
        ],
        contentZh: [
            '牙齿脱落、蛇与关系类主题。',
            '记梦技巧与快速符号指引。'
        ]
    },
    {
        slug: 'sg',
        nameEn: 'Singapore',
        nameZh: '新加坡',
        summaryEn: 'High-income, English-first market that values polished UX and privacy.',
        summaryZh: '高收入英语市场，注重体验质量与隐私。',
        audienceEn: [
            'Busy professionals and students focused on self-improvement.',
            'Multicultural audience that values credibility.'
        ],
        audienceZh: [
            '忙碌的职场人士与学生，关注自我成长。',
            '多元文化用户，重视可信度。'
        ],
        platformsEn: [
            'iOS strong adoption with premium spending.',
            'Android remains significant.'
        ],
        platformsZh: [
            'iOS 占比较高，订阅意愿强。',
            'Android 仍有体量。'
        ],
        anglesEn: [
            'Premium positioning with privacy-first messaging.',
            'Concise, actionable insights for daily life.'
        ],
        anglesZh: [
            '高品质定位 + 隐私安全强调。',
            '提供可落地的行动建议。'
        ],
        contentEn: [
            'Stress, work, and performance-related dream themes.',
            'Quick interpretations for busy schedules.'
        ],
        contentZh: [
            '压力、工作与表现相关的梦境主题。',
            '适合快节奏的简洁解析。'
        ]
    },
    {
        slug: 'ng',
        nameEn: 'Nigeria',
        nameZh: '尼日利亚',
        summaryEn: 'Large English-speaking population with strong Android usage and growing wellness interest.',
        summaryZh: '英语人口基数大，Android 为主，健康与灵性兴趣上升。',
        audienceEn: [
            'Young, mobile-first users with cultural dream interest.',
            'Community-driven sharing behavior.'
        ],
        audienceZh: [
            '年轻用户居多，移动端优先。',
            '社区型传播强，关注文化解梦。'
        ],
        platformsEn: [
            'Android-first distribution and lightweight performance.',
            'Support lower-end devices and networks.'
        ],
        platformsZh: [
            'Android 优先分发与性能优化。',
            '适配低端设备与网络环境。'
        ],
        anglesEn: [
            'Affordable access with clear privacy assurances.',
            'Culturally inclusive interpretations.'
        ],
        anglesZh: [
            '价格友好 + 隐私保障。',
            '强调文化包容的解读。'
        ],
        contentEn: [
            'Snake, chase, and water symbolism.',
            'Recurring dreams and spiritual themes.'
        ],
        contentZh: [
            '蛇梦、被追逐与水相关象征。',
            '反复梦境与灵性主题。'
        ]
    },
    {
        slug: 'za',
        nameEn: 'South Africa',
        nameZh: '南非',
        summaryEn: 'English widely used with Android dominance and interest in wellness apps.',
        summaryZh: '英语使用广泛，Android 为主，身心健康应用有需求。',
        audienceEn: [
            'Urban users interested in self-reflection.',
            'Diverse cultural perspectives on dream meaning.'
        ],
        audienceZh: [
            '城市用户注重自我反思。',
            '文化多元，梦境含义视角丰富。'
        ],
        platformsEn: [
            'Android dominant, iOS smaller premium segment.',
            'Optimize data usage and offline resilience.'
        ],
        platformsZh: [
            'Android 占主导，iOS 为小规模高价值群体。',
            '关注流量与离线可用性。'
        ],
        anglesEn: [
            'Stress relief and self-awareness framing.',
            'Trust-building through clear privacy policies.'
        ],
        anglesZh: [
            '强调减压与自我觉察。',
            '通过隐私透明建立信任。'
        ],
        contentEn: [
            'Work stress, safety, and recurring dreams.',
            'Symbol glossaries for common themes.'
        ],
        contentZh: [
            '工作压力、安全感与反复梦境。',
            '常见主题的符号词典。'
        ]
    }
];

export const marketBySlug = (slug?: string) => markets.find((market) => market.slug === slug);
