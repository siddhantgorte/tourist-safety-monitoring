import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone } from 'lucide-react-native';

export default function PhoneAuthScreen() {
    const [phone, setPhone] = useState('');
    const router = useRouter();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white p-8 justify-center"
        >
            <Text className="text-3xl font-bold text-slate-900 mb-2">Your Phone</Text>
            <Text className="text-slate-500 text-lg mb-8">We'll send a code to verify your tourist status.</Text>

            <View className="bg-slate-50 border border-slate-100 rounded-3xl p-4 flex-row items-center gap-4 mb-8">
                <Phone size={20} color="#64748b" />
                <TextInput
                    placeholder="+91 99887 76655"
                    className="flex-1 text-xl font-medium text-slate-900"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                />
            </View>

            <TouchableOpacity
                onPress={() => router.push('/auth/otp')}
                className="bg-slate-900 py-5 rounded-3xl"
            >
                <Text className="text-white text-center font-bold text-xl">Send Code</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}
