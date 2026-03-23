import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Phone, Map, Languages, LogOut, ChevronRight, QrCode } from 'lucide-react-native';
import { DEFAULT_TOURIST } from '../../constants/User';

export default function ProfileScreen() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <ScrollView className="flex-1">
                <View className="p-6">
                    {/* Profile Card */}
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 items-center">
                        <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center mb-4 border-2 border-slate-50 overflow-hidden">
                            {DEFAULT_TOURIST.avatar ? (
                                <Image source={{ uri: DEFAULT_TOURIST.avatar }} className="w-full h-full" />
                            ) : (
                                <UserIcon size={48} color="#94a3b8" />
                            )}
                        </View>
                        <Text className="text-xl font-bold text-slate-900">{DEFAULT_TOURIST.name}</Text>
                        <Text className="text-slate-500">ID Ref: {DEFAULT_TOURIST.id}</Text>

                        <View className="mt-6 p-4 bg-slate-900 rounded-2xl w-full flex-row items-center justify-between">
                            <View>
                                <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Digital Tourist ID</Text>
                                <Text className="text-white font-bold">Show QR for Verification</Text>
                            </View>
                            <QrCode size={24} color="white" />
                        </View>
                    </View>

                    {/* Sections */}
                    <Text className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-4 ml-1">Settings & Preferences</Text>

                    <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden mb-6">
                        <MenuLink icon={<Phone size={18} color="#64748b" />} label="Emergency Contacts" />
                        <MenuLink icon={<Map size={18} color="#64748b" />} label="Travel Permissions" />
                        <MenuLink icon={<Languages size={18} color="#64748b" />} label="Language: English" />
                        <MenuLink icon={<LogOut size={18} color="#ef4444" />} label="Logout" color="text-red-500" last />
                    </View>

                    <Text className="text-slate-400 text-center text-xs mt-4">Version 1.0.2 (Build 44)</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function MenuLink({ icon, label, last = false, color = "text-slate-900" }: { icon: React.ReactNode, label: string, last?: boolean, color?: string }) {
    return (
        <TouchableOpacity className={`p-4 flex-row justify-between items-center ${!last ? 'border-b border-slate-50' : ''}`}>
            <View className="flex-row items-center gap-3">
                {icon}
                <Text className={`${color} font-medium`}>{label}</Text>
            </View>
            <ChevronRight size={16} color="#cbd5e1" />
        </TouchableOpacity>
    );
}
