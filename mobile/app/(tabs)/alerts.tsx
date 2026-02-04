import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react-native';

const ALERTS = [
    { id: '1', title: 'Entering Monitored Zone', date: '2 mins ago', type: 'INFO', icon: <Bell size={18} color="#64748b" /> },
    { id: '2', title: 'High Density Warning', date: '45 mins ago', type: 'WARNING', icon: <AlertCircle size={18} color="#f59e0b" /> },
    { id: '3', title: 'Panic Alert Resolve', date: '1 hour ago', type: 'SUCCESS', icon: <CheckCircle2 size={18} color="#10b981" /> },
    { id: '4', title: 'Safety Pattern Update', date: 'Yesterday', type: 'INFO', icon: <ShieldAlert size={18} color="#8b5cf6" /> },
];

export default function AlertsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="flex-1">
                <View className="p-6 border-b border-slate-50">
                    <Text className="text-2xl font-bold text-slate-900">Safety Alerts</Text>
                    <Text className="text-slate-500 mt-1">Real-time notifications and safety updates.</Text>
                </View>
                <FlatList
                    data={ALERTS}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 24 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity className="flex-row items-center gap-4 mb-6 p-1">
                            <View className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
                                {item.icon}
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base">{item.title}</Text>
                                <Text className="text-slate-400 text-xs mt-0.5">{item.date}</Text>
                            </View>
                            <View className="w-2 h-2 rounded-full bg-slate-200" />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View className="flex-1 items-center justify-center pt-20">
                            <Bell size={48} color="#e2e8f0" />
                            <Text className="text-slate-400 mt-4 font-medium">No active alerts</Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
