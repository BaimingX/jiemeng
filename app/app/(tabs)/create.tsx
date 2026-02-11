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
import { Brain, Palette, Archive, ChevronRight, Plus, X } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addJournalEntry } from '../../lib/dreamJournal';
import { callDreamChat, AppStage } from '../../lib/dreamService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CreateScreen() {
    const router = useRouter();
    const { session } = useAuth();

    const [dreamTitle, setDreamTitle] = useState('');
    const [dreamText, setDreamText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Animation values - larger offset for more dramatic effect
    const notebookAnim = useRef(new Animated.Value(300)).current;
    const action1Anim = useRef(new Animated.Value(300)).current;
    const action2Anim = useRef(new Animated.Value(300)).current;
    const action3Anim = useRef(new Animated.Value(300)).current;
    const labelAnim = useRef(new Animated.Value(300)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Reset and play animation every time screen is focused
    useFocusEffect(
        useCallback(() => {
            // Reset all values
            notebookAnim.setValue(300);
            action1Anim.setValue(300);
            action2Anim.setValue(300);
            action3Anim.setValue(300);
            labelAnim.setValue(300);
            opacityAnim.setValue(0);

            // Play staggered fly-in animation
            Animated.parallel([
                // Fade in
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                // Staggered slide up
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
                    Animated.spring(action2Anim, {
                        toValue: 0,
                        tension: 40,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                    Animated.spring(action3Anim, {
                        toValue: 0,
                        tension: 40,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }, [])
    );

    const isGuest = useMemo(() => {
        const user = session?.user;
        return Boolean(user?.is_anonymous || user?.user_metadata?.is_guest);
    }, [session]);

    const formatDate = () => {
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${date.toLocaleDateString('en-US', options)} • ${time}`;
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

    const handleAction = async (action: 'interpret' | 'visualize' | 'archive') => {
        if (!dreamText.trim()) {
            Alert.alert("Empty Dream", "Please write about your dream first.");
            return;
        }

        const fullDream = dreamTitle.trim() ? `${dreamTitle}\n\n${dreamText}` : dreamText;

        if (action === 'archive') {
            await addJournalEntry({
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                dream: fullDream,
                analysis: '',
                style: 'ARCHIVE',
                isGuest: isGuest
            });
            setDreamTitle('');
            setDreamText('');
            router.push('/gallery');
            return;
        }

        if (action === 'visualize') {
            Alert.alert("Coming Soon", "Dream visualization feature is coming soon!");
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await callDreamChat(
                fullDream,
                AppStage.WAITING_STYLE,
                fullDream,
                'CREATIVE',
                []
            );

            if (response.text) {
                await addJournalEntry({
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    dream: fullDream,
                    analysis: response.text,
                    style: 'CREATIVE',
                    isGuest: isGuest
                });

                setDreamTitle('');
                setDreamText('');
                setIsAnalyzing(false);
                router.push('/gallery');
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to interpret dream.");
            setIsAnalyzing(false);
        }
    };

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
                        {[...Array(7)].map((_, i) => (
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
                        {tags.length > 0 && (
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
                        )}
                        {tags.length === 0 && (
                            <Text style={styles.tagHint}>Tags help you find dreams later ✨</Text>
                        )}
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
                        WHAT WOULD YOU LIKE TO DO NEXT?
                    </Animated.Text>

                    {/* Deep Interpretation */}
                    <Animated.View
                        style={{
                            opacity: opacityAnim,
                            transform: [{ translateY: action1Anim }]
                        }}
                    >
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => handleAction('interpret')}
                            disabled={isAnalyzing}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(93, 92, 222, 0.1)' }]}>
                                {isAnalyzing ? (
                                    <ActivityIndicator size="small" color="#5D5CDE" />
                                ) : (
                                    <Brain size={22} color="#5D5CDE" />
                                )}
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={styles.actionTitle}>Deep Interpretation</Text>
                                <Text style={styles.actionSubtitle}>Analyze symbols & meaning</Text>
                            </View>
                            <ChevronRight size={18} color="#D1D5DB" />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Visualize Dream */}
                    <Animated.View
                        style={{
                            opacity: opacityAnim,
                            transform: [{ translateY: action2Anim }]
                        }}
                    >
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => handleAction('visualize')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(75, 200, 169, 0.1)' }]}>
                                <Palette size={22} color="#4BC8A9" />
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
                            transform: [{ translateY: action3Anim }]
                        }}
                    >
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => handleAction('archive')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(198, 168, 124, 0.1)' }]}>
                                <Archive size={22} color="#C6A87C" />
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={styles.actionTitle}>Simply Archive</Text>
                                <Text style={styles.actionSubtitle}>Save without further action</Text>
                            </View>
                            <ChevronRight size={18} color="#D1D5DB" />
                        </TouchableOpacity>
                    </Animated.View>
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
    tagsList: {
        marginTop: 8,
    },
    tagsListContent: {
        gap: 6,
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
        marginTop: 6,
        textAlign: 'center',
    },

    // Action Section Styles
    actionSection: {
        marginTop: 20,
        gap: 10,
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderWidth: 1,
        borderColor: 'rgba(195, 180, 155, 0.35)',
        shadowColor: '#9D8B70',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTextContainer: {
        flex: 1,
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
});
