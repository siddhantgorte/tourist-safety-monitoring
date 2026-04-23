import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Info } from 'lucide-react-native';
import MapView, { Marker, Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || 'http://192.168.29.121:8000';

export default function MapScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [geofences, setGeofences] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            // 1. Get Location
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);

            // 2. Fetch Geofences
            try {
                const response = await axios.get(`${BACKEND_URL}/api/geofences`);
                if (response.data.success) {
                    setGeofences(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching geofences:', err);
            }

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

                        {geofences.map((gf) => (
                            <React.Fragment key={gf.id}>
                                <Polygon
                                    coordinates={gf.coordinates.map((c: any) => ({
                                        latitude: c.lat,
                                        longitude: c.lng
                                    }))}
                                    fillColor={
                                        gf.type === 'DANGER' ? 'rgba(239, 68, 68, 0.3)' :
                                        gf.type === 'RESTRICTED' ? 'rgba(245, 158, 11, 0.3)' :
                                        'rgba(16, 185, 129, 0.3)'
                                    }
                                    strokeColor={
                                        gf.type === 'DANGER' ? 'rgb(239, 68, 68)' :
                                        gf.type === 'RESTRICTED' ? 'rgb(245, 158, 11)' :
                                        'rgb(16, 185, 129)'
                                    }
                                    strokeWidth={2}
                                />
                                {/* Center Marker for Labels */}
                                <Marker
                                    coordinate={{
                                        latitude: gf.coordinates[0].lat,
                                        longitude: gf.coordinates[0].lng
                                    }}
                                    title={gf.name}
                                    description={`${gf.type} ZONE`}
                                >
                                    <View className="bg-white/90 px-2 py-1 rounded-md border border-slate-200">
                                        <Text className="text-[10px] font-bold text-slate-800">{gf.name}</Text>
                                    </View>
                                </Marker>
                            </React.Fragment>
                        ))}
                    </MapView>
                )}
            </View>
        </SafeAreaView>

    );
}

