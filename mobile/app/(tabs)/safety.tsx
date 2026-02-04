import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Zap, Wind, Navigation } from 'lucide-react-native';

export default function SafetyScreen() {
    const factors = [
        { label: 'Movement Consistency', score: 9.2, icon: <Navigation size={20} color="#10b981" />, color: 'emerald' },
        { label: 'Zone Integrity', score: 8.5, icon: <Shield size={20} color="#3b82f6" />, color: 'blue' },
        { label: 'Network Signal Strength', score: 7.8, icon: <Zap size={20} color="#f59e0b" />, color: 'amber' },
        { label: 'AI Anomaly Detection', score: 9.5, icon: <Wind size={20} color="#8b5cf6" />, color: 'purple' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <ScrollView className="flex-1">
                <View className="p-6">
                    <View className="items-center mb-8">
                        <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center border border-slate-100 mb-4 shadow-sm">
                            <Shield size={48} color="#10b981" fill="#10b98133" />
                        </View>
                        <Text className="text-3xl font-bold text-slate-900">Safety Analysis</Text>
                        <Text className="text-slate-500 text-center mt-2">
                            AI-driven analysis of your current travel patterns and environment.
                        </Text>
                    </View>

                    <Text className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-6 ml-1">Risk Factors Breakdown</Text>

                    {factors.map((factor, i) => (
                        <View key={i} className="mb-6">
                            <View className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center gap-3">
                                    <View className={`w-10 h-10 bg-slate-50 rounded-xl items-center justify-center`}>
                                        {factor.icon}
                                    </View>
                                    <Text className="text-slate-900 font-semibold">{factor.label}</Text>
                                </View>
                                <Text className="text-slate-900 font-bold">{factor.score}</Text>
                            </View>
                            <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <View className={`h-full bg-${factor.color}-500`} style={{ width: `${factor.score * 10}%` }} />
                            </View>
                        </View>
                    ))}

                    <View className="mt-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <Text className="text-slate-900 font-bold text-lg mb-2">Safety Insight</Text>
                        <Text className="text-slate-600 leading-relaxed">
                            Your current patterns indicate high predictability and safe behavior. You are currently in a monitored zone with rapid response coverage.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
