import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Animated,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Brain,
    Palette,
    Archive,
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Lock,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addJournalEntry } from '../../lib/dreamJournal';
import {
    callDreamChat,
    AppStage,
    AnalysisStyleId,
    PERSPECTIVE_OPTIONS,
    getSubPerspectives,
    DreamChatError,
} from '../../lib/dreamService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TRIAL_LIMIT = 5;

const STYLE_LABELS: Record<string, string> = {
    RATIONAL: 'Rational Analysis',
    PSYCHOLOGY: 'Psychological',
    FOLK: 'Cultural Traditions',
    CREATIVE: 'Creative Inspiration',
    PSY_INTEGRATIVE: 'Modern Counseling',
    PSY_FREUD: 'Freudian',
    PSY_JUNG: 'Jungian',
    FOLK_CN: 'Chinese Folk',
    FOLK_GREEK: 'Greek-Roman',
    FOLK_JUDEO: 'Judeo-Christian',
    FOLK_ISLAM: 'Islamic',
    FOLK_DHARMA: 'Buddhist/Hindu',
};

export default function CreateScreen() {
    const router = useRouter();
    const { session, billingStatus, refreshBillingStatus, setTrialRemainingHint } = useAuth();

    const [dreamTitle, setDreamTitle] = useState('');
    const [dreamText, setDreamText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Deep Interpretation expand state
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState<AnalysisStyleId | null>(null);
    const [trialRemainingLocal, setTrialRemainingLocal] = useState<number | null>(null);

    // Animation values - larger offset for more dramatic effect
    const notebookAnim = useRef(new Animated.Value(300)).current;
    const action1Anim = useRef(new Animated.Value(300)).current;
    const labelAnim = useRef(new Animated.Value(300)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Reset and play animation every time screen is focused
    useFocusEffect(
        useCallback(() => {
            notebookAnim.setValue(300);
            action1Anim.setValue(300);
            labelAnim.setValue(300);
            opacityAnim.setValue(0);

            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.stagger(100, [
                    Animated.spring(notebookAnim, {
                        toValue: 0,
                        tension: 40,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                    Animated.spring(labelAnim, {
                        toValue: 0,
                        tension: 40,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                    Animated.spring(action1Anim, {
                        toValue: 0,
                        tension: 40,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();

            refreshBillingStatus().catch(() => {
                // Ignore refresh failures.
            });
        }, [
            notebookAnim,
            action1Anim,
            labelAnim,
            opacityAnim,
            refreshBillingStatus,
        ])
    );

    const isGuest = useMemo(() => {
        const user = session?.user;
        return Boolean(user?.is_anonymous || user?.user_metadata?.is_guest);
    }, [session]);

    const hasPaidAccess = useMemo(() => {
        if (!billingStatus) return false;
        return billingStatus.access === 'lifetime' ||
            (billingStatus.access === 'subscription' && billingStatus.isActive);
    }, [billingStatus]);

    const trialRemaining = useMemo(() => {
        if (typeof trialRemainingLocal === 'number') return trialRemainingLocal;
        return billingStatus?.trialRemaining ?? TRIAL_LIMIT;
    }, [trialRemainingLocal, billingStatus]);

    const selectedStyleLabel = useMemo(() => {
        if (!selectedStyle) return 'Not selected';
        return STYLE_LABELS[selectedStyle] || selectedStyle;
    }, [selectedStyle]);

    const mainPerspectiveOptions = useMemo(
        () => PERSPECTIVE_OPTIONS.map((option) => option.id as AnalysisStyleId),
        []
    );
    const psychologyOptions = useMemo(
        () => getSubPerspectives('PSYCHOLOGY').map((option) => option.id),
        []
    );
    const culturalOptions = useMemo(
        () => getSubPerspectives('FOLK').map((option) => option.id),
        []
    );

    const selectedMainStyle = useMemo(() => {
        if (!selectedStyle) return null;
        if (selectedStyle.startsWith('PSY_') || selectedStyle === 'PSYCHOLOGY') return 'PSYCHOLOGY';
        if (selectedStyle.startsWith('FOLK_') || selectedStyle === 'FOLK') return 'FOLK';
        if (selectedStyle === 'RATIONAL') return 'RATIONAL';
        if (selectedStyle === 'CREATIVE') return 'CREATIVE';
        return null;
    }, [selectedStyle]);

    const needsSecondLayer = useMemo(
        () => selectedMainStyle === 'PSYCHOLOGY' || selectedMainStyle === 'FOLK',
        [selectedMainStyle]
    );

    const hasSecondLayerChoice = useMemo(() => {
        if (!selectedStyle) return false;
        if (selectedMainStyle === 'PSYCHOLOGY') return selectedStyle.startsWith('PSY_');
        if (selectedMainStyle === 'FOLK') return selectedStyle.startsWith('FOLK_');
        return true;
    }, [selectedMainStyle, selectedStyle]);

    const canStartInterpretation = useMemo(() => {
        if (isAnalyzing) return false;
        if (!selectedStyle) return false;
        if (!hasPaidAccess && trialRemaining <= 0) return false;
        if (needsSecondLayer && !hasSecondLayerChoice) return false;
        return true;
    }, [isAnalyzing, selectedStyle, hasPaidAccess, trialRemaining, needsSecondLayer, hasSecondLayerChoice]);

    const formatDate = () => {
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${date.toLocaleDateString('en-US', options)} - ${time}`;
    };

    const addTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const confirmSubscribe = () => {
        Alert.alert(
            'Free trial used',
            'You have used all 5 free dream interpretations. Subscribe to continue.',
            [
                { text: 'Not now', style: 'cancel' },
                { text: 'Subscribe', onPress: () => router.push('/subscribe') },
            ]
        );
    };

    const handleStyleSelect = (style: AnalysisStyleId) => {
        setSelectedStyle(style);
    };

    const getDreamText = () => (
        dreamTitle.trim() ? `${dreamTitle}\n\n${dreamText}` : dreamText
    );

    const resetDraft = () => {
        setDreamTitle('');
        setDreamText('');
        setTags([]);
        setTagInput('');
        setSelectedStyle(null);
    };

    const handleInterpret = async () => {
        const fullDream = getDreamText();

        if (!fullDream.trim()) {
            Alert.alert('Empty Dream', 'Please write about your dream first.');
            return;
        }

        if (!selectedStyle) {
            Alert.alert('Perspective required', 'Please choose a perspective first.');
            return;
        }

        if (needsSecondLayer && !hasSecondLayerChoice) {
            Alert.alert('Choose detailed perspective', 'Please select a second-layer style before starting interpretation.');
            return;
        }

        if (!hasPaidAccess && (trialRemaining <= 0 || billingStatus?.canUse === false)) {
            confirmSubscribe();
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await callDreamChat(
                fullDream,
                AppStage.WAITING_STYLE,
                fullDream,
                selectedStyle,
                []
            );

            if (typeof response.trial_remaining === 'number') {
                const safeRemaining = Math.max(0, response.trial_remaining);
                setTrialRemainingLocal(safeRemaining);
                setTrialRemainingHint(safeRemaining);

                if (!hasPaidAccess && safeRemaining > 0 && safeRemaining <= 2) {
                    Alert.alert(
                        'Trial reminder',
                        `You have ${safeRemaining} free interpretation${safeRemaining > 1 ? 's' : ''} left.`
                    );
                }
            }

            if (response.text) {
                await addJournalEntry({
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    dream: fullDream,
                    analysis: response.text,
                    style: selectedStyle,
                    isGuest,
                    tags,
                });
                resetDraft();
                await refreshBillingStatus();
                router.push('/gallery');
            }
        } catch (error) {
            if (error instanceof DreamChatError) {
                if (
                    error.code === 'subscription_required' ||
                    error.code === 'trial_exhausted' ||
                    error.status === 402
                ) {
                    setTrialRemainingLocal(0);
                    setTrialRemainingHint(0);
                    confirmSubscribe();
                } else if (error.code === 'anonymous_not_allowed') {
                    Alert.alert('Login required', 'Please sign in before interpreting dreams.');
                } else {
                    Alert.alert('Error', error.message || 'Failed to interpret dream.');
                }
            } else {
                console.error(error);
                Alert.alert('Error', 'Failed to interpret dream.');
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderStyleRow = (
        label: string,
        options: AnalysisStyleId[],
        selectedValue: AnalysisStyleId | null,
        tone: 'main' | 'sub',
        headerAccessory?: React.ReactNode
    ) => (
        <View style={styles.styleRow}>
            <View style={styles.styleRowHeader}>
                <Text style={styles.styleRowLabel}>{label}</Text>
                {headerAccessory}
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.styleTagsContent}
                style={styles.styleTagsScroll}
            >
                {options.map((option) => {
                    const isSelected = selectedValue === option;
                    return (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.styleTag,
                                tone === 'sub' && styles.styleTagSubtle,
                                isSelected && styles.styleTagSelected,
                                isSelected && tone === 'sub' && styles.styleTagSubtleSelected,
                            ]}
                            onPress={() => handleStyleSelect(option)}
                            activeOpacity={0.9}
                            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                        >
                            <Text
                                style={[
                                    styles.styleTagText,
                                    tone === 'sub' && styles.styleTagTextSubtle,
                                    isSelected && styles.styleTagTextSelected,
                                ]}
                            >
                                {STYLE_LABELS[option]}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Notebook-style Input Card */}
                <Animated.View
                    style={[
                        styles.notebookCard,
                        isInterpreting && styles.notebookCardCompact,
                        {
                            opacity: opacityAnim,
                            transform: [{ translateY: notebookAnim }],
                        }
                    ]}
                >
                    {/* Header with date */}
                    <View style={styles.notebookHeader}>
                        <Text style={styles.dateText}>{formatDate()}</Text>
                    </View>

                    {/* Title input */}
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Dream Title..."
                        placeholderTextColor="#B8B8B8"
                        value={dreamTitle}
                        onChangeText={setDreamTitle}
                        maxLength={50}
                    />

                    {/* Notebook lines background with TextInput */}
                    <View style={styles.notebookBody}>
                        {/* Render notebook lines */}
                        {[...Array(isInterpreting ? 6 : 7)].map((_, i) => (
                            <View key={i} style={styles.notebookLine} />
                        ))}
                        <TextInput
                            style={styles.input}
                            multiline
                            placeholder="What did you dream about? Capturing the details..."
                            placeholderTextColor="#C4C4C4"
                            value={dreamText}
                            onChangeText={setDreamText}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Tags Section */}
                    <View style={styles.tagsSection}>
                        <View style={styles.tagInputRow}>
                            <TextInput
                                style={styles.tagTextInput}
                                placeholder="Add a tag, e.g. flying, lucid..."
                                placeholderTextColor="#B8B8B8"
                                value={tagInput}
                                onChangeText={setTagInput}
                                onSubmitEditing={addTag}
                                returnKeyType="done"
                                maxLength={20}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.tagAddButton,
                                    !tagInput.trim() && styles.tagAddButtonDisabled
                                ]}
                                onPress={addTag}
                                disabled={!tagInput.trim()}
                            >
                                <Plus size={16} color={tagInput.trim() ? '#FFF' : '#CCC'} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.tagsMetaArea}>
                            {tags.length > 0 ? (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.tagsList}
                                    contentContainerStyle={styles.tagsListContent}
                                >
                                    {tags.map((tag) => (
                                        <View key={tag} style={styles.tagChip}>
                                            <Text style={styles.tagChipText}>{tag}</Text>
                                            <TouchableOpacity
                                                onPress={() => removeTag(tag)}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <X size={12} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <View style={styles.tagHintWrap}>
                                    <Text style={styles.tagHint}>Tags help you find dreams later.</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Corner fold effect */}
                    <View style={styles.cornerFold} />
                </Animated.View>

                {/* Action Section */}
                <View style={styles.actionSection}>
                    <Animated.Text
                        style={[
                            styles.actionLabel,
                            {
                                opacity: opacityAnim,
                                transform: [{ translateY: labelAnim }],
                            }
                        ]}
                    >
                        {isInterpreting ? 'CHOOSE A PERSPECTIVE' : 'WHAT WOULD YOU LIKE TO DO NEXT?'}
                    </Animated.Text>

                    {isInterpreting ? (
                        /* ── Expanded Perspective Panel ── */
                        <Animated.View
                            style={{
                                opacity: opacityAnim,
                                transform: [{ translateY: action1Anim }]
                            }}
                        >
                            <View style={styles.perspectivePanel}>
                                {/* Core Perspectives */}
                                {renderStyleRow(
                                    'Core Perspective',
                                    mainPerspectiveOptions,
                                    selectedMainStyle as AnalysisStyleId | null,
                                    'main',
                                    <TouchableOpacity
                                        style={styles.coreRowActionButton}
                                        onPress={() => setIsInterpreting(false)}
                                        activeOpacity={0.85}
                                    >
                                        <ChevronLeft size={14} color="#6B7280" />
                                    </TouchableOpacity>
                                )}

                                {/* Conditional sub-rows: only show when parent is selected */}
                                {selectedMainStyle === 'PSYCHOLOGY' && renderStyleRow('Psychological', psychologyOptions, selectedStyle, 'sub')}
                                {selectedMainStyle === 'FOLK' && renderStyleRow('Cultural Traditions', culturalOptions, selectedStyle, 'sub')}

                                <TouchableOpacity
                                    style={[
                                        styles.startButton,
                                        !canStartInterpretation && styles.startButtonDisabled,
                                    ]}
                                    onPress={handleInterpret}
                                    disabled={!canStartInterpretation}
                                    activeOpacity={0.9}
                                >
                                    {isAnalyzing ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <View style={styles.startButtonContent}>
                                            <Text style={styles.startButtonText}>Start Deep Interpretation</Text>
                                            <View style={styles.startButtonMeta}>
                                                {!hasPaidAccess && (
                                                    <View style={styles.startButtonTrialPill}>
                                                        <Text style={styles.startButtonTrialText}>{`${trialRemaining}/${TRIAL_LIMIT}`}</Text>
                                                    </View>
                                                )}
                                                <ChevronRight size={16} color="#FFFFFF" />
                                            </View>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {needsSecondLayer && !hasSecondLayerChoice && (
                                    <Text style={styles.secondLayerHint}>
                                        Select a detailed style below to continue.
                                    </Text>
                                )}

                                {!hasPaidAccess && trialRemaining <= 0 && (
                                    <TouchableOpacity
                                        style={styles.subscribeHintRow}
                                        onPress={confirmSubscribe}
                                        activeOpacity={0.85}
                                    >
                                        <Lock size={14} color="#F59E0B" />
                                        <Text style={styles.subscribeHintText}>Free quota finished. Tap to subscribe.</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Animated.View>
                    ) : (
                        /* ── Collapsed: 3 action buttons ── */
                        <>
                            {/* Deep Interpretation */}
                            <Animated.View
                                style={{
                                    opacity: opacityAnim,
                                    transform: [{ translateY: action1Anim }]
                                }}
                            >
                                <TouchableOpacity
                                    style={styles.actionCard}
                                    onPress={() => setIsInterpreting(true)}
                                >
                                    <View style={styles.panelIconWrap}>
                                        <Brain size={20} color="#5D5CDE" />
                                    </View>
                                    <View style={styles.actionTextContainer}>
                                        <Text style={styles.actionTitle}>Deep Interpretation</Text>
                                        <Text style={styles.actionSubtitle}>Choose a perspective to analyze</Text>
                                    </View>
                                    <ChevronRight size={18} color="#D1D5DB" />
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Visualize Dream */}
                            <Animated.View
                                style={{
                                    opacity: opacityAnim,
                                    transform: [{ translateY: action1Anim }]
                                }}
                            >
                                <TouchableOpacity
                                    style={styles.actionCard}
                                    onPress={() => Alert.alert('Coming Soon', 'Dream visualization feature is coming soon!')}
                                >
                                    <View style={[styles.panelIconWrap, { backgroundColor: 'rgba(75, 200, 169, 0.1)' }]}>
                                        <Palette size={20} color="#4BC8A9" />
                                    </View>
                                    <View style={styles.actionTextContainer}>
                                        <Text style={styles.actionTitle}>Visualize Dream</Text>
                                        <Text style={styles.actionSubtitle}>Generate artwork from your story</Text>
                                    </View>
                                    <ChevronRight size={18} color="#D1D5DB" />
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Simply Archive */}
                            <Animated.View
                                style={{
                                    opacity: opacityAnim,
                                    transform: [{ translateY: action1Anim }]
                                }}
                            >
                                <TouchableOpacity
                                    style={styles.actionCard}
                                    onPress={async () => {
                                        const fullDream = getDreamText();
                                        if (!fullDream.trim()) {
                                            Alert.alert('Empty Dream', 'Please write about your dream first.');
                                            return;
                                        }
                                        await addJournalEntry({
                                            id: Date.now().toString(),
                                            createdAt: new Date().toISOString(),
                                            dream: fullDream,
                                            analysis: '',
                                            style: 'ARCHIVE',
                                            isGuest,
                                            tags,
                                        });
                                        resetDraft();
                                        router.push('/gallery');
                                    }}
                                >
                                    <View style={[styles.panelIconWrap, { backgroundColor: 'rgba(198, 168, 124, 0.1)' }]}>
                                        <Archive size={20} color="#C6A87C" />
                                    </View>
                                    <View style={styles.actionTextContainer}>
                                        <Text style={styles.actionTitle}>Simply Archive</Text>
                                        <Text style={styles.actionSubtitle}>Save without further action</Text>
                                    </View>
                                    <ChevronRight size={18} color="#D1D5DB" />
                                </TouchableOpacity>
                            </Animated.View>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDE8DF',
    },
    content: {
        flex: 1,
        padding: 16,
        paddingTop: 24,
        paddingBottom: 100,
    },

    // Notebook Card Styles
    notebookCard: {
        backgroundColor: '#FFFCF5',
        borderRadius: 20,
        height: SCREEN_HEIGHT * 0.46,
        shadowColor: '#6B5D4D',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(180, 165, 140, 0.4)',
        overflow: 'hidden',
    },
    notebookCardCompact: {
        height: SCREEN_HEIGHT * 0.4,
    },
    notebookHeader: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'serif',
        fontStyle: 'italic',
        color: '#1F2937',
    },
    titleInput: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        fontSize: 22,
        fontFamily: 'serif',
        fontWeight: '600',
        color: '#1F2937',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(200, 185, 160, 0.3)',
    },
    notebookBody: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 4,
        position: 'relative',
    },
    notebookLine: {
        height: 1,
        backgroundColor: 'rgba(200, 185, 160, 0.2)',
        marginTop: 27,
    },
    input: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        bottom: 0,
        fontSize: 16,
        lineHeight: 28,
        color: '#374151',
        fontFamily: 'serif',
        paddingTop: 4,
    },
    cornerFold: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        backgroundColor: 'rgba(200, 185, 160, 0.12)',
        borderTopLeftRadius: 14,
    },

    // Tags Section Styles
    tagsSection: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    tagInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    tagTextInput: {
        flex: 1,
        fontSize: 13,
        color: '#374151',
        fontFamily: 'serif',
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(200, 185, 160, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(200, 185, 160, 0.3)',
    },
    tagAddButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#5D5CDE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagAddButtonDisabled: {
        backgroundColor: 'rgba(200, 185, 160, 0.2)',
    },
    tagsMetaArea: {
        marginTop: 12,
        height: 34,
        justifyContent: 'center',
    },
    tagsList: {
        flexGrow: 0,
    },
    tagsListContent: {
        gap: 6,
        alignItems: 'center',
        paddingRight: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(93, 92, 222, 0.08)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(93, 92, 222, 0.15)',
    },
    tagChipText: {
        fontSize: 12,
        color: '#5D5CDE',
        fontFamily: 'serif',
    },
    tagHint: {
        fontSize: 11,
        color: '#B8B8B8',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    tagHintWrap: {
        justifyContent: 'center',
    },

    // Action Section Styles
    actionSection: {
        marginTop: 16,
        gap: 8,
    },
    actionLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 2,
        paddingHorizontal: 4,
    },
    actionCard: {
        backgroundColor: '#FFFDF8',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(195, 180, 155, 0.35)',
        shadowColor: '#9D8B70',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionTextContainer: {
        flex: 1,
    },
    perspectivePanel: {
        backgroundColor: '#FFFDF8',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(195, 180, 155, 0.35)',
        shadowColor: '#9D8B70',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        gap: 8,
    },
    panelIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(93, 92, 222, 0.1)',
    },
    actionTitle: {
        fontSize: 15,
        fontFamily: 'serif',
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 1,
    },
    actionSubtitle: {
        fontSize: 11,
        color: '#6B7280',
    },
    styleRow: {
        gap: 4,
    },
    styleRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 24,
    },
    styleRowLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.6,
        paddingHorizontal: 2,
    },
    coreRowActionButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(170, 150, 120, 0.3)',
        backgroundColor: 'rgba(170, 150, 120, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    styleTagsScroll: {
        minHeight: 42,
    },
    styleTagsContent: {
        gap: 8,
        alignItems: 'center',
        paddingRight: 8,
    },
    styleTag: {
        minHeight: 36,
        paddingHorizontal: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(93, 92, 222, 0.25)',
        backgroundColor: 'rgba(93, 92, 222, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    styleTagSubtle: {
        borderColor: 'rgba(170, 150, 120, 0.3)',
        backgroundColor: 'rgba(170, 150, 120, 0.08)',
    },
    styleTagSelected: {
        backgroundColor: '#5D5CDE',
        borderColor: '#5D5CDE',
    },
    styleTagSubtleSelected: {
        backgroundColor: '#7367F0',
        borderColor: '#7367F0',
    },
    styleTagText: {
        fontSize: 12,
        color: '#4C4A83',
        fontWeight: '600',
    },
    styleTagTextSubtle: {
        color: '#6B5D4D',
    },
    styleTagTextSelected: {
        color: '#FFFFFF',
    },
    startButton: {
        backgroundColor: '#5D5CDE',
        borderRadius: 12,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        marginTop: 0,
    },
    startButtonDisabled: {
        backgroundColor: 'rgba(148,163,184,0.4)',
    },
    startButtonContent: {
        width: '100%',
        minHeight: 42,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    startButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    startButtonMeta: {
        position: 'absolute',
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    startButtonTrialPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
        backgroundColor: 'rgba(255,255,255,0.16)',
    },
    startButtonTrialText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    secondLayerHint: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: -2,
        marginBottom: 2,
        paddingHorizontal: 2,
    },
    subscribeHintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    subscribeHintText: {
        color: '#FBBF24',
        fontSize: 12,
    },
});
