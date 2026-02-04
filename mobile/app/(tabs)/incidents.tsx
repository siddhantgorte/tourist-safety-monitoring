import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, AlertCircle, Clock, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const INCIDENT_HISTORY = [
    {
        id: '4481',
        type: 'Medical Emergency',
        status: 'DISPATCHED',
        date: 'Today, 10:20 AM',
        lastMessage: 'Officer Rahul is being dispatched...',
        color: 'emerald'
    },
    {
        id: '4320',
        type: 'Path Obstruction',
        status: 'RESOLVED',
        date: 'Yesterday, 02:15 PM',
        lastMessage: 'Thank you for the report!',
        color: 'slate'
    },
];

export default function IncidentsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="flex-1">
                <View className="p-6 border-b border-slate-50">
                    <Text className="text-2xl font-bold text-slate-900">Incident Chats</Text>
                    <Text className="text-slate-500 mt-1">History of your safety reports and coordination.</Text>
                </View>

                <FlatList
                    data={INCIDENT_HISTORY}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/incident-report', params: { id: item.id } })}
                            className="bg-slate-50 p-5 rounded-3xl mb-4 border border-slate-100"
                        >
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-row items-center gap-2">
                                    <View className={`w-2 h-2 rounded-full ${item.status === 'DISPATCHED' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${item.status === 'DISPATCHED' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                        {item.status}
                                    </Text>
                                </View>
                                <Text className="text-slate-400 text-[10px]">{item.date}</Text>
                            </View>

                            <View className="flex-row items-center gap-4">
                                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-slate-100">
                                    <AlertCircle size={24} color={item.status === 'DISPATCHED' ? '#10b981' : '#64748b'} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-900 font-bold text-lg mb-0.5">{item.type}</Text>
                                    <Text className="text-slate-500 text-sm" numberOfLines={1}>{item.lastMessage}</Text>
                                </View>
                                <ChevronRight size={18} color="#cbd5e1" />
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View className="flex-1 items-center justify-center pt-20">
                            <MessageSquare size={48} color="#e2e8f0" />
                            <Text className="text-slate-400 mt-4 font-medium text-center px-12">
                                No incident reports found. Use the 'Report' button on Home if you need assistance.
                            </Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
