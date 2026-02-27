export type DreamClusterSlug = 'anxiety' | 'relationship' | 'nightmare' | 'growth';

export interface DreamFAQItem {
    question: string;
    answer: string;
}

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
    scenariosEn: string[];
    scenariosZh: string[];
    psychologyEn: string[];
    psychologyZh: string[];
    cultureEn: string[];
    cultureZh: string[];
    actionPlanEn: string[];
    actionPlanZh: string[];
    detailShiftsEn: string[];
    detailShiftsZh: string[];
    scenarioMatrixEn: string[];
    scenarioMatrixZh: string[];
    wakingLifeEn: string[];
    wakingLifeZh: string[];
    deepDiveEn: string[];
    deepDiveZh: string[];
    faqEn: DreamFAQItem[];
    faqZh: DreamFAQItem[];
    cluster: DreamClusterSlug;
    tags: string[];
    related: string[];
    updatedAt: string;
}

interface DreamTopicSeed {
    slug: string;
    titleEn: string;
    titleZh: string;
    questionEn: string;
    questionZh: string;
    summaryEn: string;
    summaryZh: string;
    meaningsEn?: string[];
    meaningsZh?: string[];
    reflectionsEn?: string[];
    reflectionsZh?: string[];
    cluster: DreamClusterSlug;
    tags: string[];
    related?: string[];
}

type DreamTopicSeedTuple = [
    slug: string,
    titleEn: string,
    titleZh: string,
    questionEn: string,
    questionZh: string,
    summaryEn: string,
    summaryZh: string,
    cluster: DreamClusterSlug,
    tagsCsv: string,
    relatedCsv?: string
];

const UPDATED_AT = '2026-02-27';

const splitCsv = (csv?: string): string[] =>
    (csv ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const seedTuples: DreamTopicSeedTuple[] = [
    ['teeth-falling-out', 'Teeth Falling Out', '牙齿脱落', 'Dream about teeth falling out meaning?', '梦到牙齿掉落意味着什么？', 'Often linked to stress, transition, or concerns about self-image and control.', '常与压力、变化或自我形象和掌控感担忧有关。', 'anxiety', 'stress,self-image,control,anxiety', 'falling,being-chased,naked-in-public,hair-loss'],
    ['snakes', 'Snakes', '蛇', 'What does it mean to dream about snakes?', '梦到蛇是什么意思？', 'Snakes often symbolize transformation, fear, or healing depending on context.', '蛇梦常象征转变、恐惧或疗愈，需结合情境。', 'growth', 'transformation,fear,healing,boundaries', 'water,spiders,death,fire'],
    ['flying', 'Flying', '飞行', 'Flying dream symbolism?', '飞行梦象征什么？', 'Flying dreams commonly relate to freedom, ambition, and control.', '飞行梦常与自由、目标感和掌控感有关。', 'growth', 'freedom,ambition,confidence', 'falling,ocean-waves,water,train'],
    ['falling', 'Falling', '坠落', 'Falling dream meaning?', '坠落梦代表什么？', 'Falling often signals anxiety, instability, or a loss of control.', '坠落梦常提示焦虑、不稳定或失控感。', 'nightmare', 'anxiety,instability,control', 'being-chased,teeth-falling-out,tornado,earthquake'],
    ['being-chased', 'Being Chased', '被追逐', 'Dream of being chased meaning?', '梦到被追逐是什么意思？', 'Chase dreams often reflect avoidance, pressure, or unresolved conflict.', '被追逐的梦常反映回避、压力或未解决冲突。', 'nightmare', 'avoidance,stress,conflict,fear', 'falling,teeth-falling-out,ghost,unable-to-run'],
    ['ex-partner', 'Ex Partner', '前任', 'Why do I dream about my ex?', '为什么总梦到前任？', 'Often tied to unresolved emotions, memory triggers, or current relationship patterns.', '常与未消化情绪、记忆触发或当前关系模式有关。', 'relationship', 'relationship,memory,attachment', 'cheating,wedding,baby,breakup'],
    ['pregnancy', 'Pregnancy', '怀孕', 'Pregnancy dream meaning?', '梦到怀孕代表什么？', 'Often symbolizes new ideas, growth, or a project in development.', '常象征新想法、成长或正在孕育的计划。', 'growth', 'growth,new-beginning,creativity', 'baby,house,wedding,water'],
    ['water', 'Water', '水', 'Water dream meaning?', '梦到水是什么意思？', 'Water often reflects emotions, intuition, and the flow of life.', '水常与情绪、直觉和生命流动有关。', 'growth', 'emotion,intuition,healing', 'ocean-waves,snakes,death,drowning'],
    ['death', 'Death', '死亡', 'Death dream meaning?', '梦到死亡代表什么？', 'Death dreams often symbolize endings, transformation, or a new beginning.', '死亡梦常象征结束、转变或新的开始。', 'growth', 'ending,transition,identity', 'snakes,water,house,ghost'],
    ['spiders', 'Spiders', '蜘蛛', 'Spider dream meaning?', '梦到蜘蛛是什么意思？', 'Spiders may symbolize fear, patience, creativity, or feeling trapped.', '蜘蛛梦可能象征恐惧、耐心、创造力或束缚感。', 'anxiety', 'fear,patience,complexity', 'snakes,being-chased,house,ghost'],
    ['house', 'House', '房屋', 'House dream meaning?', '梦到房子意味着什么？', 'Houses often reflect the self, boundaries, and inner life.', '房屋常象征自我、边界与内在状态。', 'growth', 'identity,home,safety,boundaries', 'pregnancy,death,water,moving-house'],
    ['naked-in-public', 'Naked in Public', '当众裸露', 'Naked in public dream meaning?', '梦到当众裸露意味着什么？', 'Often linked to vulnerability, exposure, or fear of judgment.', '常与脆弱感、暴露感或害怕被评价有关。', 'anxiety', 'vulnerability,shame,social-anxiety', 'teeth-falling-out,being-chased,public-speaking,school-exam'],
    ['school-exam', 'School or Exam', '考试或上学', 'Why do I dream about school or exams?', '为什么会梦到考试或回到学校？', 'Exam dreams often reflect performance pressure, deadlines, or fear of being unprepared.', '考试梦常与表现压力、截止日期或准备不足感有关。', 'anxiety', 'performance,deadline,perfectionism', 'running-late,teeth-falling-out,job-interview,unable-to-find-classroom'],
    ['baby', 'Baby', '婴儿', 'What does it mean to dream about a baby?', '梦到婴儿代表什么？', 'Baby dreams often relate to vulnerability, responsibility, and something new that needs care.', '梦到婴儿常与脆弱感、责任感和需要照料的新事物有关。', 'relationship', 'care,responsibility,new-start', 'pregnancy,wedding,house,lost-child'],
    ['dog', 'Dog', '狗', 'Dream about dogs meaning?', '梦到狗是什么意思？', 'Dog dreams often point to loyalty, protection, friendship, or trust concerns.', '梦到狗常指向忠诚、保护、友谊或信任议题。', 'relationship', 'trust,loyalty,protection', 'cat,house,baby,being-chased'],
    ['cat', 'Cat', '猫', 'Dream about cats meaning?', '梦到猫是什么意思？', 'Cat dreams can reflect intuition, independence, curiosity, or emotional boundaries.', '梦到猫可反映直觉、独立性、好奇心或情感边界。', 'growth', 'intuition,autonomy,boundaries', 'dog,water,house,birds'],
    ['car-crash', 'Car Crash', '车祸', 'Car crash dream meaning?', '梦到车祸意味着什么？', 'Car crash dreams often suggest fear of losing control, conflict, or sudden life disruption.', '车祸梦常提示失控恐惧、冲突升级或生活节奏被打断。', 'nightmare', 'control,burnout,conflict', 'falling,running-late,driving-no-brakes,fire'],
    ['missing-flight', 'Missing a Flight', '错过航班', 'Dream about missing a flight meaning?', '梦到错过航班意味着什么？', 'This dream usually reflects time pressure, opportunity anxiety, and fear of being left behind.', '这类梦通常反映时间压力、机会焦虑和被落下的担忧。', 'anxiety', 'deadline,opportunity,time-pressure', 'running-late,school-exam,car-crash,lost-phone'],
    ['wedding', 'Wedding', '婚礼', 'Wedding dream meaning?', '梦到婚礼代表什么？', 'Wedding dreams often symbolize commitment, integration, or concern about major life decisions.', '婚礼梦常象征承诺、整合或对重大决策的担忧。', 'relationship', 'commitment,relationship,identity', 'ex-partner,cheating,baby,breakup'],
    ['money', 'Money', '金钱', 'Money dream meaning?', '梦到钱意味着什么？', 'Money dreams often relate to value, security, confidence, and life priorities.', '金钱梦常与价值感、安全感、自信和生活优先级有关。', 'anxiety', 'security,value,decision-making', 'school-exam,running-late,house,winning-lottery'],
    ['fire', 'Fire', '火', 'Fire dream meaning?', '梦到火是什么意思？', 'Fire dreams can indicate intense emotion, anger, transformation, or urgent change.', '火的梦境可指向强烈情绪、愤怒、转变或紧急变化。', 'nightmare', 'anger,intensity,transformation', 'death,water,car-crash,tornado'],
    ['ocean-waves', 'Ocean or Waves', '海洋与海浪', 'Dream about ocean waves meaning?', '梦到海洋和海浪是什么意思？', 'Ocean dreams mirror emotional depth, uncertainty, and adaptation to changing conditions.', '海洋梦常映射情绪深度、不确定性与应对变化节奏的能力。', 'growth', 'emotion,uncertainty,adaptation', 'water,flying,death,train'],
    ['ghost', 'Ghost', '鬼魂', 'Ghost dream meaning?', '梦到鬼魂意味着什么？', 'Ghost dreams can represent unresolved memories, fear, or a past issue still asking for attention.', '鬼魂梦可代表未解记忆、恐惧或过去议题仍在影响当下。', 'nightmare', 'past,fear,memory', 'death,being-chased,spiders,blood'],
    ['cheating', 'Cheating', '出轨或背叛', 'Dream about cheating meaning?', '梦到出轨或被背叛意味着什么？', 'Cheating dreams often reflect trust anxiety, insecurity, or fear of emotional disconnection.', '出轨梦常反映信任焦虑、不安全感或情感脱节担忧。', 'relationship', 'trust,insecurity,communication', 'ex-partner,wedding,naked-in-public,breakup'],
    ['running-late', 'Running Late', '迟到', 'Running late dream meaning?', '梦到迟到意味着什么？', 'Running late dreams usually indicate time pressure, overload, and fear of underperforming.', '迟到梦通常提示时间压力、任务过载和表现焦虑。', 'anxiety', 'time,overload,performance', 'missing-flight,school-exam,car-crash,money'],
    ['lost-phone', 'Losing a Phone', '手机丢失', 'Dream about losing my phone meaning?', '梦到手机丢了意味着什么？', 'This dream often reflects fear of disconnection, lost control, or identity exposure.', '这个梦常反映失联焦虑、失控感或身份暴露担忧。', 'anxiety', 'connection,identity,communication', 'running-late,missing-flight,teeth-falling-out,phone-battery-dead'],
    ['blood', 'Blood', '血', 'Blood dream meaning?', '梦到血意味着什么？', 'Blood dreams often signal intense emotional release, fear, vitality concerns, or relationship wounds.', '血梦常提示强烈情绪释放、恐惧、生命力担忧或关系创伤。', 'nightmare', 'intensity,fear,vitality', 'fire,ghost,death,car-crash'],
    ['tornado', 'Tornado', '龙卷风', 'Tornado dream meaning?', '梦到龙卷风意味着什么？', 'Tornado dreams often point to chaotic emotions, family conflict, or sudden external pressure.', '龙卷风梦常指向情绪混乱、家庭冲突或突发外部压力。', 'nightmare', 'chaos,pressure,instability', 'earthquake,fire,falling,driving-no-brakes'],
    ['earthquake', 'Earthquake', '地震', 'Earthquake dream meaning?', '梦到地震意味着什么？', 'Earthquake dreams can reflect major life instability, foundation shifts, and uncertainty about safety.', '地震梦可反映重大不稳定、基础动摇和安全感不确定。', 'nightmare', 'foundation,instability,safety', 'tornado,falling,car-crash,house'],
    ['drowning', 'Drowning', '溺水', 'Drowning dream meaning?', '梦到溺水意味着什么？', 'Drowning dreams usually indicate emotional overwhelm, helplessness, or fear of losing support.', '溺水梦通常提示情绪淹没、无助感或失去支持的担忧。', 'nightmare', 'overwhelm,emotion,helplessness', 'water,ocean-waves,unable-to-run,being-chased'],
    ['unable-to-run', 'Unable to Run', '跑不动', 'Why can I not run in my dream?', '为什么在梦里总是跑不动？', 'This pattern often reflects powerlessness, conflict avoidance, and high-pressure paralysis.', '这个模式常反映无力感、回避冲突和高压下的僵住反应。', 'nightmare', 'powerlessness,avoidance,freeze', 'being-chased,falling,school-exam,drowning'],
    ['hair-loss', 'Hair Loss', '脱发', 'Hair loss dream meaning?', '梦到脱发意味着什么？', 'Hair-loss dreams are commonly linked to self-image anxiety, aging fears, or stress overload.', '脱发梦常与形象焦虑、衰老担忧或压力过载有关。', 'anxiety', 'self-image,stress,aging', 'teeth-falling-out,naked-in-public,money,public-speaking'],
    ['job-interview', 'Job Interview', '求职面试', 'Job interview dream meaning?', '梦到求职面试意味着什么？', 'Interview dreams often reflect performance anxiety, evaluation pressure, and identity transition stress.', '面试梦常反映表现焦虑、被评估压力和身份转型压力。', 'anxiety', 'evaluation,career,performance', 'school-exam,public-speaking,running-late,money'],
    ['public-speaking', 'Public Speaking', '公开演讲', 'Public speaking dream meaning?', '梦到公开演讲意味着什么？', 'Public-speaking dreams can indicate fear of judgment, visibility stress, and perfectionism.', '公开演讲梦可提示被评判恐惧、曝光压力和完美主义。', 'anxiety', 'visibility,judgment,confidence', 'naked-in-public,school-exam,job-interview,teeth-falling-out'],
    ['lost-child', 'Losing a Child', '孩子走失', 'Losing a child dream meaning?', '梦到孩子走失意味着什么？', 'This dream often reflects responsibility overload, guilt, and fear of failing loved ones.', '这个梦常反映责任过载、愧疚感和辜负重要关系的担忧。', 'relationship', 'care,responsibility,fear', 'baby,wedding,ex-partner,house'],
    ['burglary', 'Burglary or Intruder', '入室盗窃或闯入者', 'Burglary dream meaning?', '梦到入室盗窃意味着什么？', 'Burglary dreams often point to boundary violation, safety anxiety, and control loss.', '入室盗窃梦常指向边界被侵犯、安全焦虑和掌控感下降。', 'nightmare', 'boundary,safety,control', 'house,being-chased,ghost,earthquake'],
    ['birds', 'Birds', '鸟', 'Bird dream meaning?', '梦到鸟意味着什么？', 'Bird dreams often relate to perspective, communication, freedom, and spiritual curiosity.', '鸟梦常与视角提升、沟通、自由和精神探索相关。', 'growth', 'perspective,freedom,communication', 'flying,cat,water,train'],
    ['train', 'Train', '火车', 'Train dream meaning?', '梦到火车意味着什么？', 'Train dreams can reflect life direction, schedule pressure, and alignment with long-term plans.', '火车梦可反映人生方向、节奏压力和长期计划对齐状态。', 'growth', 'direction,timeline,planning', 'missing-flight,running-late,flying,ocean-waves'],
    ['elevator', 'Elevator', '电梯', 'Elevator dream meaning?', '梦到电梯意味着什么？', 'Elevator dreams often symbolize social mobility, emotional ups and downs, and control over transitions.', '电梯梦常象征社会流动、情绪起伏和转变阶段的掌控。', 'growth', 'transition,status,control', 'house,falling,job-interview,moving-house'],
    ['winning-lottery', 'Winning the Lottery', '中彩票', 'Winning lottery dream meaning?', '梦到中彩票意味着什么？', 'Lottery dreams can reveal desire for relief, sudden change fantasies, and value insecurity.', '中彩票梦可揭示对缓解压力的期待、突变幻想和价值不安全感。', 'growth', 'desire,security,change', 'money,job-interview,train,house'],
    ['breakup', 'Breakup', '分手', 'Breakup dream meaning?', '梦到分手意味着什么？', 'Breakup dreams often reflect attachment fear, transition stress, and emotional boundary resets.', '分手梦常反映依恋焦虑、转型压力和情感边界重置。', 'relationship', 'attachment,loss,boundary', 'ex-partner,cheating,wedding,naked-in-public'],
    ['moving-house', 'Moving House', '搬家', 'Moving house dream meaning?', '梦到搬家意味着什么？', 'Moving-house dreams usually represent identity transition, changing priorities, and adaptation load.', '搬家梦通常代表身份转变、优先级变化和适应负担。', 'growth', 'identity,transition,adaptation', 'house,train,elevator,pregnancy'],
    ['unable-to-find-classroom', 'Cannot Find Classroom', '找不到教室', 'Dream about not finding the classroom meaning?', '梦到找不到教室意味着什么？', 'This dream often reflects uncertainty about expectations, preparedness, and role clarity.', '这个梦常反映对目标要求、准备程度和角色清晰度的不确定。', 'anxiety', 'uncertainty,expectation,performance', 'school-exam,running-late,job-interview,missing-flight'],
    ['phone-battery-dead', 'Phone Battery Dead', '手机没电', 'Dream about phone battery dying meaning?', '梦到手机没电意味着什么？', 'Battery-dead dreams usually indicate energy depletion, communication stress, and support disconnect fears.', '手机没电梦通常提示精力耗尽、沟通压力和支持断联担忧。', 'anxiety', 'energy,communication,support', 'lost-phone,running-late,money,missing-flight'],
    ['driving-no-brakes', 'Driving with No Brakes', '开车刹不住', 'Dream about driving with no brakes meaning?', '梦到开车刹不住意味着什么？', 'No-brake driving dreams often signal overwhelm, runaway commitments, and poor pacing control.', '刹不住车的梦常提示压力失速、承诺失控和节奏管理失衡。', 'nightmare', 'overwhelm,pace,control', 'car-crash,tornado,running-late,falling']
];

const topicSeeds: DreamTopicSeed[] = seedTuples.map(
    ([slug, titleEn, titleZh, questionEn, questionZh, summaryEn, summaryZh, cluster, tagsCsv, relatedCsv]) => ({
        slug,
        titleEn,
        titleZh,
        questionEn,
        questionZh,
        summaryEn,
        summaryZh,
        cluster,
        tags: splitCsv(tagsCsv),
        related: splitCsv(relatedCsv)
    })
);

const clusterLensEn: Record<DreamClusterSlug, string> = {
    anxiety: 'pressure regulation and emotional load balancing',
    relationship: 'attachment security, trust repair, and communication clarity',
    nightmare: 'threat processing, safety restoration, and nervous system recovery',
    growth: 'identity transition, adaptation, and long-range direction building'
};

const clusterLensZh: Record<DreamClusterSlug, string> = {
    anxiety: '压力调节与情绪负荷管理',
    relationship: '依恋安全、信任修复与沟通清晰度',
    nightmare: '威胁加工、安全感恢复与神经系统修复',
    growth: '身份转变、适应能力与长期方向建设'
};

const defaultMeanings = (seed: DreamTopicSeed, isZh: boolean) => {
    if (isZh) {
        return [
            `“${seed.titleZh}”常与${seed.tags.slice(0, 2).join('、')}等现实议题有关。`,
            '梦境通常反映近期压力、关系变化或自我评价波动，而非单一“吉凶”。',
            '同一个符号在不同情境中含义可能不同，关键在梦中角色、情绪和结局。',
            `结合${clusterLensZh[seed.cluster]}来解读，通常比单点猜测更稳定。`,
            '如果近期出现高频重复，优先关注睡眠质量、工作负荷与关系沟通这三条主线。'
        ];
    }

    return [
        `${seed.titleEn} dreams are often connected to ${seed.tags.slice(0, 2).join(' and ')} themes in waking life.`,
        'In most cases, the symbol reflects stress processing, relationship dynamics, or shifting self-evaluation rather than destiny.',
        'Interpretation changes with role, emotion, and ending, so context usually matters more than the symbol itself.',
        `This topic is best read through a ${clusterLensEn[seed.cluster]} lens for practical next steps.`,
        'If recurrence frequency rises, review sleep quality, workload pacing, and communication friction as your first three checkpoints.'
    ];
};

const defaultReflections = (isZh: boolean) => {
    if (isZh) {
        return [
            '最近哪件现实事件与梦里情绪最接近？',
            '你在这个主题上最害怕失去什么？',
            '如果把问题缩小到本周，最小可执行动作是什么？',
            '你需要谁的支持，才能把压力从“想法”变成“行动”？'
        ];
    }

    return [
        'Which recent event matches the strongest emotion in this dream?',
        'What are you most afraid of losing in this theme?',
        'What is the smallest actionable step you can take this week?',
        'What support do you need to convert this pattern into a practical response?'
    ];
};

const buildScenarios = (seed: DreamTopicSeed, isZh: boolean) => {
    if (isZh) {
        return [
            `当“${seed.titleZh}”以突然方式出现时，通常提示你正在被某个未命名压力推着走。`,
            '如果梦里你有主动应对动作，往往代表现实中已经具备修复能力，只是执行节奏还不稳定。',
            '如果你反复处于被动位置，通常说明当前问题不是信息不足，而是边界和优先级冲突。',
            '若结局从失控转为可控，常意味着你对同类问题的认知正在升级。'
        ];
    }

    return [
        `When ${seed.titleEn} appears abruptly, it often points to unnamed pressure accelerating your decisions.`,
        'If you take action inside the dream, it usually signals latent coping capacity that is not yet consistently executed.',
        'If you stay passive across repeated scenes, the bottleneck is often boundaries and priorities, not information.',
        'When the ending shifts from escalation to control, it often indicates a real improvement in interpretation and response.'
    ];
};

const buildPsychology = (seed: DreamTopicSeed, isZh: boolean) => {
    if (isZh) {
        return [
            '从心理学视角看，梦境会在睡眠中重组记忆与情绪，用“夸张图像”放大白天未处理的感受。',
            `“${seed.titleZh}”相关梦常见于高负荷周期，尤其在任务切换、角色变化或关系不确定阶段。`,
            `该主题通常与${seed.tags.join('、')}等线索交织，建议与真实事件时间线一起解读。`,
            '核心目标不是找一个“绝对答案”，而是建立可复盘、可迭代的情绪调节流程。'
        ];
    }

    return [
        'From a psychology perspective, dreams recombine memory and emotion to process unresolved daytime load with symbolic intensity.',
        `${seed.titleEn} dreams are common during high-load periods, especially around role shifts, deadlines, or relational uncertainty.`,
        `The pattern often intersects with ${seed.tags.join(', ')}, so interpretation is strongest when tied to a real-world timeline.`,
        'The practical objective is not one perfect meaning but a repeatable regulation loop you can review and improve.'
    ];
};

const buildCulture = (seed: DreamTopicSeed, isZh: boolean) => {
    if (isZh) {
        return [
            `在民间传统中，“${seed.titleZh}”可能被解读为预警、转机或提醒，具体取决于文化语境。`,
            '文化解读适合作为“补充视角”，不建议直接作为重大决策依据。',
            '更稳妥的方法是将象征意义与现实压力源、关系事实和身体状态一起验证。',
            '当不同解释冲突时，优先采用能改善睡眠、关系和行动质量的解释路径。'
        ];
    }

    return [
        `${seed.titleEn} may be read as warning, renewal, or guidance across different traditions, depending on cultural context.`,
        'Cultural reading works best as a perspective layer, not as deterministic instruction for major decisions.',
        'The strongest interpretation combines symbolic traditions with concrete stressors, relationship facts, and body-state signals.',
        'When explanations conflict, prioritize the reading that improves sleep quality, relational clarity, and practical action.'
    ];
};

const buildDetailShifts = (isZh: boolean) => {
    if (isZh) {
        return [
            '你是主动者还是被动者，会直接改变解释方向。',
            '是否有人支持你、你是否能发声，通常对应现实中的资源可用度。',
            '梦中速度越快，现实里越可能存在节奏失衡问题。',
            '结局是缓和还是升级，往往映射当下主观掌控感。',
            '若同一细节持续出现，通常说明对应现实变量尚未被稳定处理。'
        ];
    }

    return [
        'Active versus passive role often changes the interpretation direction immediately.',
        'Support presence and ability to speak usually mirror real-world resource availability.',
        'Faster dream pacing often correlates with pacing imbalance in waking life.',
        'De-escalating versus escalating endings usually mirror your felt control level.',
        'When one detail repeats across nights, it often points to a waking variable that has not been stabilized yet.'
    ];
};

const buildActionPlan = (isZh: boolean) => {
    if (isZh) {
        return [
            '第1天：记录梦境触发点、强烈情绪和现实对应事件。',
            '第2-3天：识别一个“可减少负荷”的具体任务并执行。',
            '第4-5天：围绕同一主题做一次边界沟通或优先级重排。',
            '第6天：观察梦境是否减轻，记录强度变化。',
            '第7天：复盘本周有效动作，保留一条可长期坚持的习惯。'
        ];
    }

    return [
        'Day 1: Capture trigger, strongest emotion, and probable waking-life connection.',
        'Day 2-3: Remove one avoidable load source and complete one small corrective action.',
        'Day 4-5: Run one boundary conversation or reprioritization pass around the same theme.',
        'Day 6: Observe whether dream intensity changes and document trend direction.',
        'Day 7: Keep one habit that showed measurable relief and repeat next week.'
    ];
};

const buildScenarioMatrix = (seed: DreamTopicSeed, isZh: boolean) => {
    if (isZh) {
        return [
            `情境A（你主导）：若你在“${seed.titleZh}”场景中主动决策，通常提示你已具备修复能力。`,
            '情境B（你被动）：若你持续被推着走，常对应现实中边界感下降或目标冲突。',
            '情境C（有人协助）：若出现支持者，常代表你现实中可调用资源比想象更多。',
            '情境D（公开暴露）：若在他人注视下发生，通常与评价焦虑和形象压力相关。',
            '情境E（重复循环）：若同场景多次重演，优先检查未处理的高频触发因素。'
        ];
    }

    return [
        `Scenario A (you lead): when you actively navigate ${seed.titleEn}, it usually signals available coping capacity.`,
        'Scenario B (you freeze): repeated passivity often maps to weakened boundaries or conflicting priorities.',
        'Scenario C (support appears): helpers in the scene often indicate underused resources in real life.',
        'Scenario D (public exposure): audience pressure usually links to evaluation anxiety and identity protection.',
        'Scenario E (looping replay): repeated loops strongly suggest one unresolved trigger requires direct intervention.'
    ];
};

const buildWakingLife = (seed: DreamTopicSeed, isZh: boolean) => {
    if (isZh) {
        return [
            `把“${seed.titleZh}”映射到现实时，先查过去7天里最耗能的三个场景。`,
            '再标注每个场景的情绪强度（1-10分）和可控度（高/中/低）。',
            '优先处理“高强度 + 可控”的问题，这类动作对梦境缓解通常最有效。',
            '将结果写进梦境日记，观察一周后频率和强度是否下降。',
            '若高强度梦持续影响睡眠或日常功能，建议及时寻求专业支持。',
            '记录干预后的变化趋势，重点观察“情绪恢复速度”是否在两周内提升。'
        ];
    }

    return [
        `To map ${seed.titleEn} to waking life, start with the three most energy-draining scenes from the past seven days.`,
        'Score each scene by emotional intensity (1-10) and controllability (high/medium/low).',
        'Prioritize high-intensity but controllable items first; these interventions often reduce dream intensity fastest.',
        'Log the outcome in your dream journal and compare frequency and emotional load after one week.',
        'If intensity continues to disrupt sleep or daytime function, seek professional support promptly.',
        'Track trend direction after each intervention and focus on whether emotional recovery speed improves within two weeks.'
    ];
};

const buildDeepDive = (seed: DreamTopicSeed, isZh: boolean) => {
    if (isZh) {
        return [
            `“${seed.titleZh}”这类梦最有价值的用法，不是猜测“会发生什么”，而是识别“你正在如何承压”。当梦境反复出现，它往往提示同一压力源还在重复激活你的情绪系统。`,
            `把主题放进${clusterLensZh[seed.cluster]}框架后，你会更容易把抽象焦虑变成可执行动作：先定位触发，再定义边界，再安排恢复节奏。`,
            '如果你只停留在“好/坏”判断，梦境信息很快会失真；若你持续记录场景、角色、节奏和结局，梦境会逐渐变成稳定的自我反馈系统。',
            '长期来看，梦境解读的目标是让你在白天更快识别模式、更早调整选择，并减少高负荷状态下的反应性决策。',
            '当你把梦境记录与每周行动结果放在同一张时间线上时，通常可以更快看见真正有效的改变杠杆。'
        ];
    }

    return [
        `${seed.titleEn} is most useful when treated as a stress-processing signal, not as a prediction engine. Recurrence usually means the same trigger keeps activating your emotional system.`,
        `When interpreted through a ${clusterLensEn[seed.cluster]} frame, the symbol becomes operational: detect trigger, define boundary, and schedule recovery rhythm.`,
        'If interpretation stays at good-versus-bad labeling, insight decays quickly. If you track role, pacing, emotion, and ending, dream content becomes a reliable feedback loop.',
        'Over time, the real gain is faster daytime pattern detection, earlier intervention, and fewer reactive decisions under pressure.',
        'When dream logs and weekly actions are reviewed on the same timeline, leverage points become clearer and behavior change compounds faster.'
    ];
};

const buildFaq = (seed: DreamTopicSeed, isZh: boolean): DreamFAQItem[] => {
    if (isZh) {
        return [
            {
                question: `梦到${seed.titleZh}一定是坏预兆吗？`,
                answer: '不一定。多数情况下它反映情绪和压力处理状态，而不是固定吉凶结论。'
            },
            {
                question: `为什么我会反复梦到${seed.titleZh}？`,
                answer: '重复梦通常表示某个现实议题尚未被处理完成，建议结合日记记录查找触发模式。'
            },
            {
                question: '我应该仅凭这个梦做重大决策吗？',
                answer: '不建议。梦境适合用于反思，应结合事实信息与专业建议共同判断。'
            },
            {
                question: '什么时候需要寻求专业支持？',
                answer: '当梦境持续影响睡眠、工作或关系时，应尽快咨询心理或医疗专业人士。'
            }
        ];
    }

    return [
        {
            question: `Is dreaming about ${seed.titleEn.toLowerCase()} always a bad sign?`,
            answer: 'Not necessarily. It usually reflects emotional processing load rather than a fixed outcome.'
        },
        {
            question: `Why does the ${seed.titleEn.toLowerCase()} dream keep repeating?`,
            answer: 'Recurring dreams often indicate one unresolved trigger pattern. Tracking context helps surface it.'
        },
        {
            question: 'Should I make major decisions based only on this dream?',
            answer: 'No. Use dream interpretation as reflection input, then combine it with facts and professional advice.'
        },
        {
            question: 'When should I seek professional support?',
            answer: 'If dream intensity keeps impairing sleep, focus, or relationships, seek licensed professional guidance.'
        }
    ];
};

const toTopic = (seed: DreamTopicSeed): DreamTopic => ({
    ...seed,
    meaningsEn: seed.meaningsEn ?? defaultMeanings(seed, false),
    meaningsZh: seed.meaningsZh ?? defaultMeanings(seed, true),
    reflectionsEn: seed.reflectionsEn ?? defaultReflections(false),
    reflectionsZh: seed.reflectionsZh ?? defaultReflections(true),
    scenariosEn: buildScenarios(seed, false),
    scenariosZh: buildScenarios(seed, true),
    psychologyEn: buildPsychology(seed, false),
    psychologyZh: buildPsychology(seed, true),
    cultureEn: buildCulture(seed, false),
    cultureZh: buildCulture(seed, true),
    detailShiftsEn: buildDetailShifts(false),
    detailShiftsZh: buildDetailShifts(true),
    actionPlanEn: buildActionPlan(false),
    actionPlanZh: buildActionPlan(true),
    scenarioMatrixEn: buildScenarioMatrix(seed, false),
    scenarioMatrixZh: buildScenarioMatrix(seed, true),
    wakingLifeEn: buildWakingLife(seed, false),
    wakingLifeZh: buildWakingLife(seed, true),
    deepDiveEn: buildDeepDive(seed, false),
    deepDiveZh: buildDeepDive(seed, true),
    faqEn: buildFaq(seed, false),
    faqZh: buildFaq(seed, true),
    related: seed.related ?? [],
    updatedAt: UPDATED_AT
});

export const dreamTopics: DreamTopic[] = topicSeeds.map(toTopic);

export const dreamTopicBySlug = (slug?: string) => dreamTopics.find((topic) => topic.slug === slug);

export const getTopicsByCluster = (cluster: DreamClusterSlug) =>
    dreamTopics.filter((topic) => topic.cluster === cluster);

const scoreRelatedTopic = (source: DreamTopic, candidate: DreamTopic) => {
    let score = 0;

    if (source.cluster === candidate.cluster) score += 4;

    const sourceTags = new Set(source.tags);
    const sharedTags = candidate.tags.filter((tag) => sourceTags.has(tag)).length;
    score += sharedTags * 2;

    if (source.related.includes(candidate.slug)) score += 3;
    if (candidate.related.includes(source.slug)) score += 1;

    return score;
};

export const getRecommendedRelatedTopics = (sourceTopic: DreamTopic, limit = 10) => {
    const scored = dreamTopics
        .filter((topic) => topic.slug !== sourceTopic.slug)
        .map((topic) => ({ topic, score: scoreRelatedTopic(sourceTopic, topic) }))
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.topic.titleEn.localeCompare(b.topic.titleEn);
        });

    const minCount = Math.min(8, scored.length);
    const safeLimit = Math.max(8, Math.min(limit, 12));
    const finalLimit = Math.min(Math.max(safeLimit, minCount), scored.length);

    return scored.slice(0, finalLimit).map((item) => item.topic);
};
