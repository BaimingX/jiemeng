import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Heart, MessageCircle, MoreHorizontal, Filter, RefreshCw, Moon, Star } from 'lucide-react-native';

// Dummy Data from the HTML example
const GALLERY_ITEMS = [
    {
        id: '1',
        title: "The Empty Classroom",
        date: "2/1/2026",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1zgrWAV5KvwtksMI-WZqsoU2bIuSrHYzhyfOok098OpoOV1ZdfeLOJikFm5G3Tgu6ksDQsfJFGAR5hZAUQWVyAwUjYXQVT4a2GzSl8Jzlx5EwRHv7m2Qrf2-jz2eOTph86P1FwURE27oAPeGYKYD4FUVK0UULu6C-2AMG_0AvfIbObr7wgMZmOhcO1Zgobx9VYBBv68Y5H85PZ8DhnLrurBLIhGLwx5CYse3LLHj4BEj3rKXrk1MBi_4L7sj6rAREFEC0FWS__NA",
        type: "Shared Dream",
        likes: 124,
        aspectRatio: 4 / 5,
        userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtoD6B1Mz2wyi0NDMZ0GRoPtv5VYTS224p6GQVUcqOcnwquhHxSHtMskM7W13NdZS6MgCTBGF2aFvVugMm9mje8mY89JCCd01demAmY4di_4C95YoD5PMcAByEvBmGWxCdgSRGlcNzugwj6AHv3IpGZFKvNJy8hpkXmvbJ_BHTllkukpKwXLB1xgd_htHZMfTXJaHvX0ezf34A_mXYKEIk8bKUIhLJ0uCtRSKCfiMSUatcwWEhSucC7xdGAmSr6SK1_YRivmXSH4Y"
    },
    {
        id: '4', // Floating Islands - moved up for masonry split
        title: "Floating Islands",
        date: "1/15/2026",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRCyjz-jQ4RaWMQqtsAxsDAm6vMQwk2vzQp7wkYS3frABJMAxs_6f9A94_SF8wLhheW2075ya-DP7gtCXun_pZVQ-zYb9wntqMrVbsGI9wHVbxHJrhdVvsrYMCxYRkNVn-Y1LlpSzR6gtzeVMEQTF1dqW4jOnwqfF27zdWs64CCNESZBzwPDq-nBa88iwrer1nhau2QEh-Xb1mn76x2yMPVivQrfZW6quYVsSDB6qJdCYLXh66oQ4Hfs5rw_oBNBi7FF_UHzOLMHs",
        type: "Recurring",
        likes: "2.1k",
        aspectRatio: 3 / 4,
        userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWEHoT6v_NlnpeDU53AnAKqPFP1Ub_1SU1gfRicAOZ6wd0AaZqcu9MqBLzQIpiQaLETkASVRo17ogWPNw4poPA2plY69VYihmxzABKl2m-IZW1Wh9W0rH_zKN9KuynVaqVx72vjTb2liGVcS8Sn8E6j8_tfeixFipsfIlrOhO0kD4nzKzGOrGZ26nvz_wxvmWduxgW6axFHBXuqTPV5oebN8b8QEbUK3tYkLKKH1kV-FojT4V-qs0S26VfBOlVYO_MIMT8T6vCpmA"
    },
    {
        id: '2',
        title: "Flight to Nowhere",
        date: "1/24/2026",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJzl73rpD5SY22VO60UOxwpBw1fYxB2zgrqFKftRhjdaHlc_bsaFTiC5kMk-FTUwFv-by1Tas1Q03VNQGoOLgiCVPEQtsTcaXXQKWla5ifoYRjPUQKrHgyswVgY9JC_Eqi03NpdQoLslgadA4PbfKqrVra2zBYdTDs7AJ_ik2RGZ2FgySryU9lx-2LuAhbqZws022eWUbC4PMG9VxcLMGqJp1CojhxCVNJvo1hVfwFmIAaLLtD1qPindb1CtJ8Xgq9g4zAe21mYFI",
        type: "Lucid State",
        likes: 89,
        aspectRatio: 3 / 4,
        userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKJJypEaw-WTc63z-7Z0m1U2IwgSSYZRHyAiIWIr-r83MpEOhn5ypXVJ9drsXznSTXMZVaGS5NcHX-z7Ov0rjA2YEgZuTnzADbXaELqzYdBsoqhv2bG4bI7U3CWwkQcQfOmGZ7FJVFtdiXugiupujdkgoh--oqu_bHBQECTza1oUX_w71aJdjlak4h-tkAufsu5WVychX6xLRzGGMW4jH1-xPnw37r4rAxpCOaoWGCRv0pnpXP9cNQZGoqVeuhhAdpTopbV_5YGrg"
    },
    {
        id: '3',
        title: "Neon Forest Run",
        date: "Yesterday",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDB8bMm3dAGzh5sn5KmCFROjM-gEAQrzZVgcDJmwR7gAP2iV_sr7q6va8a4eSI3hg5NnB-QnzsHqSx7_e3VhdZ-SbmQ9GR7RRhaU2zAGmPLN16fxI76PcuQw5PMAfVkqs4xob-Tlx07DA_tVK3VvEpmYmz4mYfccKvTFm7ckLWRbGG-MFY_MTOdsqKsjMTn0W6IkUWokfkwLJ10saky_MK2TzRDaV92olHhITN8PttOCRSZT9Ylq3x25hRUae3P2Gbrab59HzNiHNk",
        type: "Nightmare",
        likes: 42,
        aspectRatio: 4 / 5,
        userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAn338R2JJDIQ8uYCgUmtsVG0eG0FqZCUP-YWAPiwZSRUlPujPIiB_dqRnOvuGfM918KaeQN7Rs_dTPeaKD44N7Ll-EWw5u01YN_FM5C77_h7ojVstaNS4AlzSCl65wHUtPzl_0sky_0vhwsPf8RDxki4JvGmamv2lX8iJiK2CET_YkenGqAOSD9EkUedBFJav-GLorbkswYJq3SdOKAWJst-ZGs4sCNJL-gcPRJiV-W6a2nKS0FHQCv0eflxEd9nXx7xu84rEFvFE"
    },
    {
        id: '5',
        title: "Geometric Fear",
        date: "1/10/2026",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeO5RTVCQJGe6odE0PnfTkLN0SweoOs9758VMOOfWQMrwBElI1XhOpvXu8nH7Hs-_2JZ2VXBqar2Dgo2_DRQV-8AZS8Q0lu_Lvkxhl-tS27ssce3z-s9XBNsDKxDU3_rML3SoKt30KQZy-cKlguM10vQEkM1wZT2jbMEnJrHHkHFnBtwyb2ufTQylBJ1oBvviAoBZ059EmgnOZdI63WiW2Zeq6nhuevVK-D2vkpBE9LwPfBP_kyawCaHK_YrcRwSXNJc93RfCgbXQ",
        type: "Analysis",
        likes: 15,
        aspectRatio: 1,
        userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFbp_Bb-WgBi2bIWGVNxw5wzAdtTFDB1TGJ5NUf-b5A3Anf7_nzhDpiGqXHWMqrI89Sl-0ofGKr0Uw78eu5A8-wsrlTbQuQGUT3LsQsn8s3MamSAO8Ct09zgBB-bk4YXsnrXC6c-hxRZGk2C8l4NN0hL8HVhbZYSPlg_qVqQm4EGfx1mEIljTbEw7e6NfZYk7cHQ86D8QYyjahB3j8JWhelxH3I7IuBx3B-v3gbL-2sfZabnu-lOI6Y7eTF7--wc1bQ47TgE31lik"
    },
    {
        id: '6',
        title: "Mirror Lake",
        date: "1/05/2026",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDt4NpdUcALJW8ZOw9boB7ejA8uQakNpP57iU8cEVkVk96vklaserEjEfeAuoWGz-ya_21gqBbslktfJOGAOJAVXZ2xvec7cTMxLWu5qMqX9hwEXCjrK6-vnEok0s_J5tMWEjAH5Jpb81EFDJHhYowMEVb1efL3-iNQ4DttFIo3xG8PI_1_Z9aavj12beZ7BefBAegGZr4anii6ZrlNeFzr48X9qdv9umKyVsnY5oeKa_sKxONr9nqXNZlegB9LZUwt9r4qiJ_SZic",
        type: "Lucid",
        likes: 330,
        aspectRatio: 3 / 5,
        userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRZ12_r1wnbU26Dw_la-x3gTaJyQRbXJP98Ref0NwP8IxVS8wOYHZOc5etGAkqIzBiGLtLUdy7R2lygAzG9p-hQeYVYtA981mSKN9xPV3aDc7lG6vAe-Ex-hdtZPiCNwdQiCfuxzwpxYJvZnGozRR1Tqr3clcKM0t6TsTCfkPepDTUgR368IZ4wzd5AT4vSHPFM_vqRC15A6uT7zl8O9BHRuy5dQ_BVXLpW1TA47hCdMtQxrdjFgcAXd5sQY5E2TKOsy2a3GRSv6s"
    },
];

const FILTER_TABS = ["Curated", "Shared Dreams", "Trending", "Following"];

// Render a single card
const GalleryCard = ({ item }: { item: typeof GALLERY_ITEMS[0] }) => {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <View style={[styles.imageContainer, { aspectRatio: item.aspectRatio }]}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />

                {/* Gradient Overlay */}
                <View style={styles.cardOverlay} />

                {/* Content */}
                <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                        {/* Empty top for now, space for actions if needed */}
                    </View>

                    <View style={styles.cardBottom}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardDate}>{item.date}</Text>
                            <Text style={styles.cardTitle}>{item.title}</Text>

                            <View style={styles.cardMeta}>
                                <Image
                                    source={{ uri: item.userAvatar }}
                                    style={styles.userAvatar}
                                />
                                <Text style={styles.cardType}>{item.type}</Text>
                            </View>
                        </View>

                        <View style={styles.cardStats}>
                            <View style={styles.heartBtn}>
                                <Heart size={14} color={item.id === '1' ? '#D4B168' : 'rgba(255,255,255,0.6)'} fill={item.id === '1' ? '#D4B168' : 'transparent'} />
                            </View>
                            <Text style={styles.likeCount}>{item.likes}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function GalleryScreen() {
    const [activeTab, setActiveTab] = useState("Curated");

    // Split items into two columns
    const column1 = GALLERY_ITEMS.filter((_, i) => i % 2 === 0);
    const column2 = GALLERY_ITEMS.filter((_, i) => i % 2 !== 0);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#06070B" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoIcon}>
                        <Moon size={18} color="#D4B168" fill="#D4B168" />
                    </View>
                    <Text style={styles.headerTitle}>Oneiro AI</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Search size={22} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatarContainer}>
                        <Image
                            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0Rb8zo579Uo9YDbLNUSno5EmvszHkNqwe2Kr5ZydCoqJHIi-j2y85VrUKr5WvF3cI5Ier1fPmxm8nAy6vtPEXmivVEIC3WTeqkaPVZdW5IQpBoAhGA0CzxLzvKzsDs3bJb6Vzwe8JazKcbHeaq12RN4Jr6ObHxqgCYWYAVeUyUDN45v8gWZxWpWyOK32SN1ZlvcyEktUn93dViKHptsoSt7Lx8y844YtzCFVy3WGA5UmzQgSwgZHnf16AqYcovD5Qdi60Qm2gXS0" }}
                            style={styles.headerAvatar}
                        />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>333</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Tabs - Horizontal Scroll */}
            <View style={styles.tabContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabContent}
                >
                    {FILTER_TABS.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                style={[styles.tabItem, isActive && styles.activeTabItem]}
                            >
                                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Subheader */}
                <View style={styles.subheader}>
                    <View>
                        <Text style={styles.sectionTitle}>Oneiro AI Community</Text>
                        <Text style={styles.sectionSubtitle}>PUBLIC GALLERY</Text>
                    </View>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Filter size={14} color="#D1D5DB" />
                        <Text style={styles.filterBtnText}>Filter</Text>
                    </TouchableOpacity>
                </View>

                {/* Masonry Grid */}
                <View style={styles.masonryContainer}>
                    {/* Left Column */}
                    <View style={styles.column}>
                        {column1.map(item => (
                            <GalleryCard key={item.id} item={item} />
                        ))}
                    </View>

                    {/* Right Column */}
                    <View style={styles.column}>
                        {column2.map(item => (
                            <GalleryCard key={item.id} item={item} />
                        ))}
                    </View>
                </View>

                {/* Load More */}
                <TouchableOpacity style={styles.loadMoreBtn}>
                    <RefreshCw size={16} color="#D4B168" />
                    <Text style={styles.loadMoreText}>Load More Dreams</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#06070B', // background-dark
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(6, 7, 11, 0.95)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(212, 177, 104, 0.2)', // primary/20
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'serif',
        letterSpacing: 0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBtn: {
        padding: 8,
        borderRadius: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    badge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#D4B168',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderWidth: 1,
        borderColor: '#06070B',
    },
    badgeText: {
        color: '#000000',
        fontSize: 8,
        fontWeight: 'bold',
    },
    tabContainer: {
        paddingVertical: 16,
    },
    tabContent: {
        paddingHorizontal: 20,
        gap: 24,
    },
    tabItem: {
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabItem: {
        borderBottomColor: '#D4B168',
    },
    tabText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#D4B168',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    subheader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'serif',
    },
    sectionSubtitle: {
        color: '#9CA3AF',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
        marginTop: 2,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#0E1016', // surface-dark
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    filterBtnText: {
        color: '#D1D5DB',
        fontSize: 12,
        fontWeight: '500',
    },
    masonryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 16,
    },
    column: {
        flex: 1,
        gap: 16,
    },
    card: {
        borderRadius: 16,
        backgroundColor: '#0E1016',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    imageContainer: {
        width: '100%',
        position: 'relative',
    },
    cardImage: {
        ...StyleSheet.absoluteFillObject,
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)', // Base dim
        // In RN, gradients need a library like expo-linear-gradient.
        // For standard RN, we simulate with background color with opacity or multiple views.
        // Or simply stick to a solid wash if we can't use linear-gradient without checking deps.
        // Since I see no expo-linear-gradient in deps (assumed), I'll stick to a dark overlay.
    },
    cardContent: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.1)', // Subtle gradient replacement
    },
    cardTop: {
        // Empty
    },
    cardBottom: {
        width: '100%',
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardDate: {
        color: '#D1D5DB',
        fontSize: 10,
        marginBottom: 2,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'serif',
        fontWeight: '600',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    userAvatar: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cardType: {
        color: '#D1D5DB',
        fontSize: 10,
    },
    cardStats: {
        flexDirection: 'column',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        bottom: 0,
        gap: 2,
    },
    heartBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        // backdropFilter not supported in RN directly, relying on rgba for transparency
    },
    likeCount: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    loadMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#0E1016',
        marginHorizontal: 80,
        paddingVertical: 12,
        borderRadius: 24,
        marginTop: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    loadMoreText: {
        color: '#E5E7EB',
        fontSize: 12,
        fontWeight: '500',
    }
});
