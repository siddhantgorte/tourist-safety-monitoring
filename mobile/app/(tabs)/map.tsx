import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Info } from 'lucide-react-native';

export default function MapScreen() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Simulation of a Map */}
            <View className="flex-1 bg-slate-200 items-center justify-center relative overflow-hidden">
                <View className="absolute inset-0 opacity-10 flex-row flex-wrap">
                    {Array.from({ length: 200 }).map((_, i) => (
                        <View key={i} className="w-10 h-10 border-[0.5px] border-slate-400" />
                    ))}
                </View>

                <View className="items-center z-10">
                    <View className="bg-emerald-500/20 p-8 rounded-full border border-emerald-500/50">
                        <MapPin size={48} color="#10b981" fill="#10b981" />
                    </View>
                    <Text className="text-slate-900 font-bold text-xl mt-4">Interactive Safety Map</Text>
                    <Text className="text-slate-500 text-center px-12 mt-2">
                        Real-time tracking and geo-fence alerts active for Calangute region.
                    </Text>
                </View>

                {/* Floating Zone Info */}
                <View className="absolute bottom-8 left-8 right-8 bg-white/90 p-4 rounded-3xl border border-slate-200 backdrop-blur-md shadow-lg">
                    <View className="flex-row justify-between items-start mb-2">
                        <View>
                            <Text className="text-slate-900 font-bold text-lg">Calangute - Zone A</Text>
                            <Text className="text-slate-500 text-xs uppercase font-bold">Safe Monitored Area</Text>
                        </View>
                        <View className="bg-emerald-100 px-3 py-1 rounded-full">
                            <Text className="text-emerald-700 text-xs font-bold">ACTIVE</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                        <Info size={14} color="#64748b" />
                        <Text className="text-slate-500 text-xs">Stay within marked boundaries for optimal assistance.</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
