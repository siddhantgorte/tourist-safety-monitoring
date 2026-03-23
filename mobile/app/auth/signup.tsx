import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 items-center justify-center p-8">
                <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-8">
                    <Shield size={48} color="#10b981" />
                </View>
                
                <Text className="text-4xl font-black text-slate-900 text-center">Join TourSafe</Text>
                <Text className="text-slate-500 text-center mt-4 text-lg px-4 leading-relaxed">
                    Your safety is our priority. Complete our guided registration to get started with round-the-clock monitoring.
                </Text>

                <TouchableOpacity
                    onPress={() => router.push('/onboarding')}
                    className="bg-emerald-600 w-full py-5 rounded-3xl mt-12 flex-row items-center justify-center gap-2 shadow-xl shadow-emerald-200"
                >
                    <Text className="text-white font-bold text-xl">Start Registration</Text>
                    <ChevronRight size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/auth/login')}
                    className="mt-8"
                >
                    <Text className="text-slate-500 text-lg">Already have an account? <Text className="text-emerald-600 font-bold">Login</Text></Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
