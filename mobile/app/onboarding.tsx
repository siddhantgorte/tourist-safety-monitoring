import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Lock, MapPin } from 'lucide-react-native';

export default function OnboardingScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white p-8 justify-center">
            <View className="items-center mb-12">
                <View className="w-20 h-20 bg-emerald-100 rounded-3xl items-center justify-center mb-6">
                    <Shield size={40} color="#10b981" />
                </View>
                <Text className="text-3xl font-bold text-slate-900 text-center">Smart Tourist Safety</Text>
                <Text className="text-slate-500 text-center mt-3 text-lg px-4">
                    A proactive safety companion for your journey in monitored regions.
                </Text>
            </View>

            <View className="gap-8 mb-16">
                <FeatureItem
                    icon={<Lock size={24} color="#64748b" />}
                    title="Secure Identity"
                    desc="Digital Tourist ID linked only to your trip duration."
                />
                <FeatureItem
                    icon={<MapPin size={24} color="#64748b" />}
                    title="Real-time Tracking"
                    desc="Opt-in location sharing for rapid emergency response."
                />
            </View>

            <TouchableOpacity
                onPress={() => router.push('/auth/phone')}
                className="bg-emerald-500 py-5 rounded-3xl shadow-lg shadow-emerald-200"
            >
                <Text className="text-white text-center font-bold text-xl">Get Started</Text>
            </TouchableOpacity>
        </View>
    );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <View className="flex-row gap-4 items-start">
            <View className="mt-1">{icon}</View>
            <View className="flex-1">
                <Text className="text-slate-900 font-bold text-lg">{title}</Text>
                <Text className="text-slate-500 leading-relaxed">{desc}</Text>
            </View>
        </View>
    );
}
