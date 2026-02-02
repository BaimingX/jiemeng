import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, Save } from 'lucide-react-native';

export default function DreamDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-dream-bg">
            <View className="flex-row justify-between items-center px-4 py-4">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-serif text-lg">Dream Visualization</Text>
                <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                    <View className="flex-row gap-1">
                        <View className="w-1 h-1 bg-white rounded-full" />
                        <View className="w-1 h-1 bg-white rounded-full" />
                        <View className="w-1 h-1 bg-white rounded-full" />
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                <View className="aspect-[3/4] w-full bg-indigo-900 mx-4 self-center rounded-3xl overflow-hidden my-4 relative shadow-2xl shadow-black">
                    {/* Placeholder Image */}
                    <View className="absolute inset-0 items-center justify-center">
                        <Text className="text-white/50">Dream Image {id}</Text>
                    </View>

                    <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <View className="flex-row gap-2 mb-2">
                            <View className="bg-purple-600 px-2 py-1 rounded-md"><Text className="text-white text-xs font-bold uppercase">Surrealism</Text></View>
                            <View className="bg-gray-700 px-2 py-1 rounded-md"><Text className="text-white text-xs font-bold uppercase">High Detail</Text></View>
                        </View>
                        <Text className="text-white text-lg font-serif italic">"Floating through a galaxy of clockwork stars..."</Text>
                    </View>
                </View>

                <View className="bg-orange-50 border border-orange-100 rounded-2xl mx-4 p-4 mb-8">
                    <Text className="text-orange-800 font-bold mb-1">Image expires in 7 days</Text>
                    <Text className="text-orange-600 text-sm">Save this visualization to your personal library to keep it forever.</Text>
                </View>

                <View className="px-4 pb-8">
                    <TouchableOpacity className="bg-white rounded-xl py-4 items-center mb-4 flex-row justify-center gap-2">
                        <Save size={20} color="black" />
                        <Text className="text-black font-bold text-lg">Save to Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-dream-purple rounded-xl py-4 items-center flex-row justify-center gap-2">
                        <Share2 size={20} color="white" />
                        <Text className="text-white font-bold text-lg">Share Dream</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
