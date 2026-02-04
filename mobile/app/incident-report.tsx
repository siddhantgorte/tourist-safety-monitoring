import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Camera, Image as ImageIcon, AlertCircle, X, CheckCircle, ChevronLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function IncidentReportScreen() {
    const { id } = useLocalSearchParams();
    const [step, setStep] = useState<'form' | 'chat'>(id ? 'chat' : 'form');
    const [description, setDescription] = useState(id ? 'I am experiencing a medical emergency near the beach entrance.' : '');
    const [media, setMedia] = useState<string[]>(id ? ['https://picsum.photos/200/200'] : []);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { id: '1', role: 'system', text: 'You are connected to Tourism Safety Support.', time: '10:20' },
    ]);

    const router = useRouter();

    useEffect(() => {
        if (id) {
            // Simulate existing chat history
            setChat([
                { id: '1', role: 'system', text: 'You are connected to Tourism Safety Support.', time: '10:20' },
                { id: '2', role: 'system', text: 'Incident reported. An officer will be with you shortly.', time: '10:21' },
                { id: '3', role: 'agent', text: 'Hello, I see you are reporting a medical emergency. How can we help?', time: '10:22' },
                { id: '4', role: 'user', text: 'I have a deep cut on my leg.', time: '10:25' },
            ]);
        }
    }, [id]);

    const handleReport = () => {
        if (!description) return;
        setStep('chat');
        setChat([...chat, { id: '2', role: 'system', text: 'Incident reported. An officer will be with you shortly.', time: 'Now' }]);
    };

    const simulateAddMedia = () => {
        setMedia([...media, 'https://picsum.photos/200/200']);
    };

    const sendMessage = () => {
        if (!message) return;
        const newMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChat([...chat, newMessage]);
        setMessage('');

        setTimeout(() => {
            setChat(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                text: 'We have received your details. Help is on the way.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 2000);
    };

    if (step === 'form') {
        return (
            <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
                <ScrollView className="flex-1 p-6">
                    <View className="flex-row items-center mb-6">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <ChevronLeft size={24} color="#64748b" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-slate-900">New Safety Report</Text>
                    </View>

                    <View className="items-center mb-8">
                        <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-4">
                            <AlertCircle size={32} color="#f59e0b" />
                        </View>
                        <Text className="text-slate-500 text-center mt-1">Provide details for authorities to assist you.</Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-slate-700 font-bold mb-2">Description</Text>
                        <TextInput
                            className="bg-slate-50 border border-slate-100 rounded-2xl p-4 min-h-[120px] text-slate-800"
                            placeholder="What is happening? Describe the situation..."
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View className="mb-8">
                        <Text className="text-slate-700 font-bold mb-4">Media Attachments</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {media.map((uri, i) => (
                                <View key={i} className="relative">
                                    <Image source={{ uri }} className="w-20 h-20 rounded-xl" />
                                    <TouchableOpacity
                                        onPress={() => setMedia(media.filter((_, idx) => idx !== i))}
                                        className="absolute -top-2 -right-2 bg-slate-900 rounded-full w-6 h-6 items-center justify-center border-2 border-white"
                                    >
                                        <X size={12} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity
                                onPress={simulateAddMedia}
                                className="w-20 h-20 bg-slate-50 border border-dashed border-slate-200 rounded-xl items-center justify-center"
                            >
                                <Camera size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleReport}
                        className={`py-5 rounded-3xl ${description ? 'bg-slate-900' : 'bg-slate-200'} mb-10`}
                        disabled={!description}
                    >
                        <Text className={`text-center font-bold text-lg ${description ? 'text-white' : 'text-slate-400'}`}>
                            File Incident Report
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1 bg-white"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View className="bg-slate-50 p-4 pt-2 border-b border-slate-100 flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()} className="mr-1">
                        <ChevronLeft size={24} color="#64748b" />
                    </TouchableOpacity>
                    <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                        <CheckCircle size={20} color="#10b981" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-slate-900 font-bold">Case: #{id || '4481'}</Text>
                        <Text className="text-emerald-600 text-[10px] font-bold tracking-tighter">DISPATCH IN PROGRESS</Text>
                    </View>
                    <TouchableOpacity onPress={() => setStep('form')} className="bg-white border border-slate-100 px-3 py-1.5 rounded-full">
                        <Text className="text-slate-600 text-[10px] font-bold">VIEW REPORT</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    className="flex-1 p-4"
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {chat.map((item) => (
                        <View
                            key={item.id}
                            className={`mb-4 max-w-[85%] ${item.role === 'user' ? 'self-end bg-emerald-500 rounded-2xl rounded-tr-none shadow-sm' : item.role === 'system' ? 'self-center bg-slate-100 px-4 py-2 rounded-full mt-2' : 'self-start bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100'}`}
                        >
                            <View className="p-3">
                                <Text className={`${item.role === 'user' ? 'text-white font-medium' : item.role === 'system' ? 'text-slate-500 text-xs text-center' : 'text-slate-800'}`}>
                                    {item.text}
                                </Text>
                                {item.role !== 'system' && (
                                    <Text className={`text-[10px] mt-1 ${item.role === 'user' ? 'text-emerald-100 text-right opacity-80' : 'text-slate-400'}`}>
                                        {item.time}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View className="p-4 border-t border-slate-100 flex-row items-center gap-3 bg-white">
                    <TouchableOpacity className="p-2 bg-slate-50 rounded-full border border-slate-100">
                        <ImageIcon size={20} color="#64748b" />
                    </TouchableOpacity>
                    <View className="flex-1 bg-slate-50 rounded-3xl flex-row items-center px-4 py-1 border border-slate-100">
                        <TextInput
                            placeholder="Type a message..."
                            className="flex-1 py-2 text-slate-800 max-h-24"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                        />
                        <TouchableOpacity onPress={sendMessage}>
                            <Send size={20} color={message ? "#10b981" : "#cbd5e1"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
