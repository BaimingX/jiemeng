import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Profile() {
    return (
        <View className="flex-1 bg-dream-bg justify-center items-center">
            <Text className="text-white mb-4">Profile</Text>
            <TouchableOpacity
                onPress={() => supabase.auth.signOut()}
                className="bg-red-500 px-4 py-2 rounded-lg"
            >
                <Text className="text-white font-bold">Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}
