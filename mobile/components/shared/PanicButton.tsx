import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { AlertTriangle, X, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function PanicButton() {
    const [active, setActive] = useState(false);
    const insets = useSafeAreaInsets();
    const [countdown, setCountdown] = useState(5);
    const [isTriggered, setIsTriggered] = useState(false);

    const handlePress = () => {
        setActive(true);
        setCountdown(5);
        // Start countdown logic here if needed
    };

    const cancelPanic = () => {
        setActive(false);
        setIsTriggered(false);
    };

    const triggerSOS = () => {
        setIsTriggered(true);
        // Call backend API / Socket signal here
    };

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
                className="absolute w-16 h-16 bg-red-600 rounded-full items-center justify-center shadow-2xl shadow-red-400 z-50"
                style={{ bottom: insets.bottom + 80, right: 24 }}
            >
                <AlertTriangle size={32} color="white" />
            </TouchableOpacity>

            <Modal transparent visible={active} animationType="fade">
                <View className="flex-1 bg-red-900/95 justify-center items-center p-8">
                    <View className="items-center">
                        {!isTriggered ? (
                            <>
                                <View className="w-48 h-48 rounded-full border-4 border-white/20 items-center justify-center mb-8">
                                    <Text className="text-white text-7xl font-bold">SOS</Text>
                                </View>
                                <Text className="text-white text-3xl font-bold text-center mb-4">Are you in danger?</Text>
                                <Text className="text-red-100 text-center mb-12 text-lg">
                                    Pressing 'Trigger SOS' will notify local authorities and emergency contacts immediately.
                                </Text>

                                <TouchableOpacity
                                    onPress={triggerSOS}
                                    className="bg-white w-full py-5 rounded-3xl mb-4"
                                >
                                    <Text className="text-red-600 text-center font-bold text-xl">TRIGGER SOS</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={cancelPanic}
                                    className="w-full py-4"
                                >
                                    <Text className="text-white/60 text-center font-medium">I'm Safe, Cancel</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View className="w-48 h-48 bg-white rounded-full items-center justify-center mb-8 shadow-2xl shadow-white/50">
                                    <ShieldCheck size={80} color="#dc2626" />
                                </View>
                                <Text className="text-white text-4xl font-bold text-center mb-4">Help is Coming</Text>
                                <Text className="text-red-100 text-center mb-12 text-xl italic">
                                    Your live location is being shared with the nearest response unit.
                                </Text>

                                <View className="bg-red-800/50 p-6 rounded-3xl border border-red-700/50 w-full mb-8">
                                    <View className="flex-row items-center gap-3 mb-2">
                                        <View className="w-2 h-2 rounded-full bg-blue-400" />
                                        <Text className="text-white font-bold">Calangute Police Unit B</Text>
                                    </View>
                                    <Text className="text-red-200 text-sm">Estimated Response: 4-6 minutes</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={cancelPanic}
                                    className="border border-white/20 w-full py-4 rounded-3xl"
                                >
                                    <Text className="text-white/60 text-center font-medium">De-escalate Alert</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}
