import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';

export default function OTPAuthScreen() {
    const [otp, setOtp] = useState('');
    const router = useRouter();

    const handleVerify = () => {
        // In a real app, verify OTP then:
        router.replace('/(tabs)');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white p-8 justify-center"
        >
            <View className="w-16 h-16 bg-slate-50 rounded-2xl items-center justify-center mb-6">
                <Lock size={32} color="#10b981" />
            </View>
            <Text className="text-3xl font-bold text-slate-900 mb-2">Verify OTP</Text>
            <Text className="text-slate-500 text-lg mb-12">Enter the 6-digit code sent to your mobile.</Text>

            <View className="flex-row gap-3 mb-8 justify-between">
                {Array.from({ length: 4 }).map((_, i) => (
                    <View key={i} className="w-16 h-20 bg-slate-50 border border-slate-100 rounded-2xl items-center justify-center">
                        <Text className="text-2xl font-bold text-slate-900">{otp[i] || '•'}</Text>
                    </View>
                ))}
            </View>

            <TextInput
                className="opacity-0 absolute"
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
                onChangeText={(val) => {
                    setOtp(val);
                    if (val.length === 4) handleVerify();
                }}
            />

            <TouchableOpacity
                onPress={handleVerify}
                className="bg-emerald-500 py-5 rounded-3xl"
            >
                <Text className="text-white text-center font-bold text-xl">Verify & Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity className="mt-8">
                <Text className="text-slate-500 text-center font-medium">Resend Code in 0:45</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}
