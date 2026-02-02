import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { Home, Plus, BookOpen, User, Sparkles } from 'lucide-react-native';

const CustomTabBarButton = ({ children, onPress }: any) => (
    <TouchableOpacity
        style={{
            top: -20, // Float above
            justifyContent: 'center',
            alignItems: 'center',
            ...styles.shadow
        }}
        onPress={onPress}
        activeOpacity={0.9}
    >
        <View style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#5D5CDE', // primary
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            {children}
        </View>
    </TouchableOpacity>
);

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    backgroundColor: '#FDFBF7', // bg-light
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(0,0,0,0.05)',
                    height: Platform.OS === 'ios' ? 85 : 70,
                    paddingTop: 10,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.tabItem}>
                            <Home size={24} color={focused ? '#5D5CDE' : '#9CA3AF'} />
                            <Text style={[styles.tabLabel, { color: focused ? '#5D5CDE' : '#9CA3AF' }]}>Home</Text>
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="gallery"
                options={{
                    title: 'Journal',
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.tabItem}>
                            <BookOpen size={24} color={focused ? '#5D5CDE' : '#9CA3AF'} />
                            <Text style={[styles.tabLabel, { color: focused ? '#5D5CDE' : '#9CA3AF' }]}>Journal</Text>
                        </View>
                    ),
                }}
            />

            {/* Custom "Add" Button in middle */}
            <Tabs.Screen
                name="create"
                options={{
                    title: 'Record',
                    tabBarIcon: ({ focused }) => (
                        <Plus size={30} color="#FFFFFF" />
                    ),
                    tabBarButton: (props) => (
                        <CustomTabBarButton {...props} />
                    ),
                }}
            />

            <Tabs.Screen
                name="insights" // Placeholder, redirect or stub
                options={{
                    title: 'Insights',
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.tabItem}>
                            <Sparkles size={24} color={focused ? '#5D5CDE' : '#9CA3AF'} />
                            <Text style={[styles.tabLabel, { color: focused ? '#5D5CDE' : '#9CA3AF' }]}>Insights</Text>
                        </View>
                    ),
                }}
                redirect={true} // For now
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.tabItem}>
                            <User size={24} color={focused ? '#5D5CDE' : '#9CA3AF'} />
                            <Text style={[styles.tabLabel, { color: focused ? '#5D5CDE' : '#9CA3AF' }]}>Profile</Text>
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#5D5CDE',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 5,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
    }
});
