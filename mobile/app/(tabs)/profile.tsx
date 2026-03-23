import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Phone, Map, Languages, LogOut, ChevronRight, QrCode, Globe, Clock, MapPinned } from 'lucide-react-native';
import { useAtom } from 'jotai';
import { tokenAtom, userAtom } from '../../atoms/auth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const [user, setUser] = useAtom(userAtom);
    const [, setToken] = useAtom(tokenAtom);
    const router = useRouter();

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        router.replace('/auth/login');
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-8">
                <Text className="text-slate-500 mb-8 text-center text-lg">Please log in to view your safety profile.</Text>
                <TouchableOpacity 
                    onPress={() => router.push('/auth/login')}
                    className="bg-slate-900 px-12 py-4 rounded-2xl"
                >
                    <Text className="text-white font-bold">Go to Login</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <ScrollView className="flex-1">
                <View className="p-6">
                    {/* Profile Header */}
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 items-center">
                        <View className="w-24 h-24 bg-emerald-50 rounded-full items-center justify-center mb-4 border-2 border-emerald-100 overflow-hidden">
                            <UserIcon size={48} color="#10b981" />
                        </View>
                        <Text className="text-2xl font-bold text-slate-900">{user.fullName}</Text>
                        <Text className="text-slate-500 font-medium">{user.email}</Text>
                        
                        <View className="mt-4 px-4 py-1.5 bg-emerald-100 rounded-full">
                            <Text className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Active Tourist</Text>
                        </View>
                    </View>

                    {/* Trip Status Card */}
                    <View className="bg-slate-900 p-6 rounded-3xl mb-6 shadow-xl shadow-slate-200">
                        <View className="flex-row items-center gap-2 mb-4">
                            <MapPinned size={18} color="#10b981" />
                            <Text className="text-white font-bold">Trip Status</Text>
                        </View>
                        
                        <View className="flex-row justify-between mb-4">
                            <View className="flex-1">
                                <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Duration</Text>
                                <Text className="text-white font-medium">{user.tripDuration ? `${user.tripDuration} Days` : 'Not Set'}</Text>
                            </View>
                            <View className="flex-1 border-l border-slate-700 pl-4">
                                <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Origin</Text>
                                <Text className="text-white font-medium">{user.nationality || 'Global'}</Text>
                            </View>
                        </View>

                        <View className="pt-4 border-t border-slate-700">
                            <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Planned Exploration</Text>
                            <Text className="text-white font-medium leading-5">{user.citiesExploring || 'Searching for adventures...'}</Text>
                        </View>
                    </View>

                    {/* Menu Options */}
                    <Text className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-4 ml-1">Settings & Security</Text>
                    <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden mb-6">
                        <MenuLink icon={<QrCode size={18} color="#64748b" />} label="Digital Tourist ID" />
                        <MenuLink icon={<Languages size={18} color="#64748b" />} label="Language: English" />
                        <MenuLink 
                            icon={<LogOut size={18} color="#ef4444" />} 
                            label="Logout" 
                            color="text-red-500" 
                            last 
                            onPress={handleLogout}
                        />
                    </View>

                    <Text className="text-slate-400 text-center text-[10px] uppercase tracking-tighter">Verified Tourist Secure Account • ID: {user.id.slice(0, 8)}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function MenuLink({ icon, label, last = false, color = "text-slate-900", onPress }: any) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className={`p-4 flex-row justify-between items-center ${!last ? 'border-b border-slate-50' : ''}`}
        >
            <View className="flex-row items-center gap-3">
                {icon}
                <Text className={`${color} font-medium`}>{label}</Text>
            </View>
            <ChevronRight size={16} color="#cbd5e1" />
        </TouchableOpacity>
    );
}
