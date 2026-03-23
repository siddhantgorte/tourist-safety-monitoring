import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Info } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            setLoading(false);
        })();
    }, []);

    const initialRegion = location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    } : {
        latitude: 15.5494, // Default to Calangute, Goa if location not available
        longitude: 73.7535,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="flex-1 relative">
                {loading ? (
                    <View className="flex-1 items-center justify-center bg-slate-100">
                        <ActivityIndicator size="large" color="#10b981" />
                        <Text className="text-slate-500 mt-4">Fetching live safety data...</Text>
                    </View>
                ) : (
                    <MapView
                        style={StyleSheet.absoluteFillObject}
                        provider={PROVIDER_DEFAULT}
                        initialRegion={initialRegion}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                    >
                        {location && (
                            <Marker
                                coordinate={{
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude,
                                }}
                                title="Your Location"
                                description="You are currently in a monitored zone"
                            >
                                <View className="bg-emerald-500 p-2 rounded-full border-2 border-white shadow-lg">
                                    <MapPin size={24} color="white" fill="white" />
                                </View>
                            </Marker>
                        )}
                        
                        {/* Simulation of a Geo-fence Zone */}
                        <Marker
                            coordinate={{ latitude: 15.5494, longitude: 73.7535 }}
                            title="Calangute Safety Hub"
                            description="Main monitoring station"
                        />
                    </MapView>
                )}
            </View>
        </SafeAreaView>

    );
}

