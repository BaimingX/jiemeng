export interface DreamTopic {
    slug: string;
    titleEn: string;
    titleZh: string;
    questionEn: string;
    questionZh: string;
    summaryEn: string;
    summaryZh: string;
    meaningsEn: string[];
    meaningsZh: string[];
    reflectionsEn: string[];
    reflectionsZh: string[];
    related: string[];
}

export const dreamTopics: DreamTopic[] = [
    {
        slug: 'teeth-falling-out',
        titleEn: 'Teeth Falling Out',
        titleZh: '牙齿脱落',
        questionEn: 'Dream about teeth falling out meaning?',
        questionZh: '梦到牙齿掉落意味着什么？',
        summaryEn: 'Often linked to stress, transition, or concerns about self-image and control.',
        summaryZh: '常与压力、变化或自我形象和掌控感有关。',
        meaningsEn: [
            'Feeling exposed, judged, or worried about appearance.',
            'Transition periods where control feels shaky.',
            'Pressure around communication or confidence.'
        ],
        meaningsZh: [
            '担心他人评价或自我形象受影响。',
            '处于变化期，掌控感变弱。',
            '沟通或自信心压力的体现。'
        ],
        reflectionsEn: [
            'What recent change feels destabilizing?',
            'Where do you feel less confident lately?',
            'What small action would restore control?'
        ],
        reflectionsZh: [
            '最近有什么变化让你不安？',
            '哪里让你感觉自信下降？',
            '哪件小事能帮你找回掌控感？'
        ],
        related: ['being-chased', 'falling', 'naked-in-public']
    },
    {
        slug: 'snakes',
        titleEn: 'Snakes',
        titleZh: '蛇之梦',
        questionEn: 'What does it mean to dream about snakes?',
        questionZh: '梦到蛇是什么意思？',
        summaryEn: 'Snakes often symbolize transformation, fear, or healing depending on context.',
        summaryZh: '蛇梦常象征转变、恐惧或疗愈，需结合情境。',
        meaningsEn: [
            'A life change that feels intense or uncertain.',
            'Hidden fears or a need to set boundaries.',
            'Healing, renewal, or personal growth.'
        ],
        meaningsZh: [
            '正在经历强烈或不确定的变化。',
            '隐藏的恐惧或需要设立边界。',
            '疗愈、更新或成长的信号。'
        ],
        reflectionsEn: [
            'What change are you resisting or avoiding?',
            'Is there a boundary you need to reinforce?',
            'Where could healing begin now?'
        ],
        reflectionsZh: [
            '你在抗拒或回避什么变化？',
            '是否有需要加强的边界？',
            '当下可以从哪里开始疗愈？'
        ],
        related: ['water', 'spiders', 'death']
    },
    {
        slug: 'flying',
        titleEn: 'Flying',
        titleZh: '飞行梦',
        questionEn: 'Flying dream symbolism?',
        questionZh: '飞行梦象征什么？',
        summaryEn: 'Flying dreams commonly relate to freedom, ambition, and control.',
        summaryZh: '飞行梦常与自由、目标感和掌控感有关。',
        meaningsEn: [
            'Feeling empowered or ready to take risks.',
            'Desire to escape pressure or constraints.',
            'Confidence building toward a goal.'
        ],
        meaningsZh: [
            '感到有力量或准备冒险。',
            '想逃离压力或限制。',
            '对目标更有信心。'
        ],
        reflectionsEn: [
            'Where do you want more freedom?',
            'What goal feels within reach now?',
            'How can you reduce daily constraints?'
        ],
        reflectionsZh: [
            '你想在哪些方面更自由？',
            '哪个目标现在更接近了？',
            '如何减少日常束缚？'
        ],
        related: ['falling', 'naked-in-public', 'water']
    },
    {
        slug: 'falling',
        titleEn: 'Falling',
        titleZh: '坠落梦',
        questionEn: 'Falling dream meaning?',
        questionZh: '坠落梦代表什么？',
        summaryEn: 'Falling often signals anxiety, instability, or a loss of control.',
        summaryZh: '坠落梦常提示焦虑、不稳定或失控感。',
        meaningsEn: [
            'Pressure from work or relationships.',
            'Fear of failure or disappointing others.',
            'Uncertainty about future direction.'
        ],
        meaningsZh: [
            '工作或关系压力增大。',
            '害怕失败或让人失望。',
            '对未来方向感到不确定。'
        ],
        reflectionsEn: [
            'What feels unstable right now?',
            'Where can you ask for support?',
            'What is one step to regain stability?'
        ],
        reflectionsZh: [
            '当下有什么不稳定的感受？',
            '你可以向谁寻求支持？',
            '哪一步能帮助你稳住节奏？'
        ],
        related: ['being-chased', 'teeth-falling-out', 'naked-in-public']
    },
    {
        slug: 'being-chased',
        titleEn: 'Being Chased',
        titleZh: '被追逐',
        questionEn: 'Dream of being chased meaning?',
        questionZh: '梦到被追逐是什么意思？',
        summaryEn: 'Chase dreams often reflect avoidance, pressure, or unresolved conflict.',
        summaryZh: '被追逐的梦常反映回避、压力或未解决的冲突。',
        meaningsEn: [
            'Avoiding a difficult decision or conversation.',
            'Feeling overwhelmed by responsibilities.',
            'An internal fear you have not faced.'
        ],
        meaningsZh: [
            '回避某个艰难决定或对话。',
            '责任过多导致压力过大。',
            '内在恐惧尚未被直面。'
        ],
        reflectionsEn: [
            'What are you avoiding right now?',
            'Which responsibility feels the heaviest?',
            'What would facing it look like?'
        ],
        reflectionsZh: [
            '你正在回避什么？',
            '哪项责任最让你有压力？',
            '直面它会是什么样子？'
        ],
        related: ['falling', 'teeth-falling-out', 'ex-partner']
    },
    {
        slug: 'ex-partner',
        titleEn: 'Ex Partner',
        titleZh: '梦到前任',
        questionEn: 'Why do I dream about my ex?',
        questionZh: '为什么总梦到前任？',
        summaryEn: 'Often tied to unresolved emotions, memory triggers, or current relationship patterns.',
        summaryZh: '常与未消化的情绪、记忆触发或关系模式有关。',
        meaningsEn: [
            'You are processing unfinished feelings.',
            'A current situation reminds you of the past.',
            'You are reflecting on what you need in a relationship.'
        ],
        meaningsZh: [
            '你在处理未完成的情绪。',
            '当前情境触发了过去记忆。',
            '你在反思关系中的需求。'
        ],
        reflectionsEn: [
            'What emotion lingers from that relationship?',
            'What lesson do you want to keep?',
            'How do you want to show up now?'
        ],
        reflectionsZh: [
            '那段关系留下了什么情绪？',
            '你想保留的经验是什么？',
            '现在你希望怎样面对关系？'
        ],
        related: ['teeth-falling-out', 'water', 'naked-in-public']
    },
    {
        slug: 'pregnancy',
        titleEn: 'Pregnancy',
        titleZh: '怀孕之梦',
        questionEn: 'Pregnancy dream meaning?',
        questionZh: '梦到怀孕代表什么？',
        summaryEn: 'Often symbolizes new ideas, growth, or a project in development.',
        summaryZh: '常象征新想法、成长或正在孕育的计划。',
        meaningsEn: [
            'A new project or creative phase.',
            'Personal growth and change.',
            'Anticipation and responsibility.'
        ],
        meaningsZh: [
            '新项目或创意阶段。',
            '个人成长与变化。',
            '期待与责任感。'
        ],
        reflectionsEn: [
            'What are you developing right now?',
            'Where do you feel growth happening?',
            'What support do you need?'
        ],
        reflectionsZh: [
            '你正在孕育什么？',
            '你感到成长在哪些方面发生？',
            '你需要什么支持？'
        ],
        related: ['house', 'water', 'flying']
    },
    {
        slug: 'water',
        titleEn: 'Water',
        titleZh: '梦到水',
        questionEn: 'Water dream meaning?',
        questionZh: '梦到水是什么意思？',
        summaryEn: 'Water often reflects emotions, intuition, and the flow of life.',
        summaryZh: '水常与情绪、直觉和生命流动有关。',
        meaningsEn: [
            'Emotional state or intensity.',
            'A need for cleansing or release.',
            'Intuition becoming stronger.'
        ],
        meaningsZh: [
            '情绪状态或强度。',
            '需要释放或净化。',
            '直觉变得更强。'
        ],
        reflectionsEn: [
            'What emotion is most present?',
            'Do you need to release something?',
            'Where can you trust your intuition?'
        ],
        reflectionsZh: [
            '哪种情绪最明显？',
            '你需要释放什么？',
            '哪里可以相信直觉？'
        ],
        related: ['snakes', 'pregnancy', 'death']
    },
    {
        slug: 'death',
        titleEn: 'Death',
        titleZh: '梦到死亡',
        questionEn: 'Death dream meaning?',
        questionZh: '梦到死亡代表什么？',
        summaryEn: 'Death dreams often symbolize endings, transformation, or a new beginning.',
        summaryZh: '死亡之梦常象征结束、转变或新的开始。',
        meaningsEn: [
            'Closing a chapter in life.',
            'Letting go of an old identity.',
            'Major transition underway.'
        ],
        meaningsZh: [
            '一个阶段的结束。',
            '放下旧的身份或习惯。',
            '正在经历重大转变。'
        ],
        reflectionsEn: [
            'What is ending or changing for you?',
            'What do you want to release?',
            'What new chapter is opening?'
        ],
        reflectionsZh: [
            '你正在结束或改变什么？',
            '你想放下什么？',
            '新的阶段是什么？'
        ],
        related: ['snakes', 'water', 'house']
    },
    {
        slug: 'spiders',
        titleEn: 'Spiders',
        titleZh: '蜘蛛之梦',
        questionEn: 'Spider dream meaning?',
        questionZh: '梦到蜘蛛是什么意思？',
        summaryEn: 'Spiders often symbolize fear, creativity, or feeling trapped.',
        summaryZh: '蜘蛛之梦可能象征恐惧、创造力或被束缚感。',
        meaningsEn: [
            'Anxiety about a situation or person.',
            'Creative energy and patience.',
            'Feeling stuck in a web of obligations.'
        ],
        meaningsZh: [
            '对某个情境或人感到焦虑。',
            '创造力和耐心。',
            '被责任困住的感觉。'
        ],
        reflectionsEn: [
            'What feels sticky or complicated?',
            'Where can you be more patient?',
            'Is there a small step to untangle?'
        ],
        reflectionsZh: [
            '什么让你感觉复杂或难缠？',
            '哪里需要更多耐心？',
            '有什么小动作可以解开？'
        ],
        related: ['snakes', 'being-chased', 'house']
    },
    {
        slug: 'house',
        titleEn: 'Houses',
        titleZh: '房屋之梦',
        questionEn: 'House dream meaning?',
        questionZh: '梦到房子意味着什么？',
        summaryEn: 'Houses often reflect the self, personal boundaries, and inner life.',
        summaryZh: '房屋常象征自我、边界与内在状态。',
        meaningsEn: [
            'Exploring different sides of yourself.',
            'Need for safety and stability.',
            'Changes in identity or life stage.'
        ],
        meaningsZh: [
            '探索自我的不同面向。',
            '对安全与稳定的需求。',
            '身份或阶段的变化。'
        ],
        reflectionsEn: [
            'Which room felt most significant?',
            'Where do you need more stability?',
            'What part of you is changing?'
        ],
        reflectionsZh: [
            '哪个房间最让你在意？',
            '你需要更多稳定感的地方在哪？',
            '你正在改变的部分是什么？'
        ],
        related: ['pregnancy', 'death', 'water']
    },
    {
        slug: 'naked-in-public',
        titleEn: 'Naked in Public',
        titleZh: '当众裸露',
        questionEn: 'Naked in public dream meaning?',
        questionZh: '梦到当众裸露意味着什么？',
        summaryEn: 'Often linked to vulnerability, exposure, or fear of judgment.',
        summaryZh: '常与脆弱感、暴露感或害怕被评判有关。',
        meaningsEn: [
            'Feeling exposed or unprepared.',
            'Fear of criticism or rejection.',
            'Desire to be authentic without shame.'
        ],
        meaningsZh: [
            '感觉自己暴露或不够准备。',
            '担心被批评或拒绝。',
            '渴望真实表达而不羞耻。'
        ],
        reflectionsEn: [
            'Where do you feel judged?',
            'What would make you feel more prepared?',
            'How can you show up more honestly?'
        ],
        reflectionsZh: [
            '你在哪些场景感到被评判？',
            '什么能让你更有准备？',
            '如何更真实地表达？'
        ],
        related: ['teeth-falling-out', 'being-chased', 'ex-partner']
    }
];

export const dreamTopicBySlug = (slug?: string) => dreamTopics.find((topic) => topic.slug === slug);
