"use client"

import React, { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, Polygon, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Icons
const touristIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854866.png', // Person icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const incidentIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface MapComponentProps {
  center?: [number, number]
  zoom?: number
  regionGeometry?: any
  liveTourists?: any[]
  incidents?: any[]
  focusedTouristId?: string | null
  focusCoords?: { lat: number, lng: number, label: string } | null
  layers?: {
    tourists: boolean
    officers: boolean
    incidents: boolean
  }
  isDrawingMode?: boolean
  tempFenceCoords?: [number, number][]
  onMapClick?: (coords: [number, number]) => void
  activeGeofences?: any[]
}

// Sub-components
function FocusHandler({ liveTourists, focusedTouristId }: { liveTourists: any[], focusedTouristId: string | null }) {
  const map = useMap();

  useEffect(() => {
    if (focusedTouristId) {
      const tourist = liveTourists.find(t => t.id === focusedTouristId);
      if (tourist) {
        map.setView([tourist.lat, tourist.lng], 16, { animate: true });
      }
    }
  }, [focusedTouristId, liveTourists, map]);

  return null;
}

function CoordinateFocusHandler({ focusCoords }: { focusCoords: { lat: number, lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (focusCoords) {
      map.setView([focusCoords.lat, focusCoords.lng], 16, { animate: true });
    }
  }, [focusCoords, map]);

  return null;
}

function ResizeHandler({ regionGeometry }: { regionGeometry?: any }) {
  const map = useMap()
  
  useEffect(() => {
    const invalidationTimes = [100, 500, 1000]
    const timers = invalidationTimes.map(ms => 
      setTimeout(() => {
        map.invalidateSize()
      }, ms)
    )

    if (regionGeometry) {
      try {
        const geojsonLayer = L.geoJSON(regionGeometry)
        map.fitBounds(geojsonLayer.getBounds(), { padding: [50, 50] })
      } catch (e) {
        console.error("Failed to fit bounds", e)
      }
    }

    const handleResize = () => { map.invalidateSize() }
    window.addEventListener("resize", handleResize)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener("resize", handleResize)
    }
  }, [map, regionGeometry])
  
  return null
}

function MapEventsHandler({ isDrawingMode, onMapClick }: { isDrawingMode?: boolean, onMapClick?: (c: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      if (isDrawingMode && onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng])
      }
    }
  })
  return null
}

function TouristMarker({ t, isFocused }: { t: any, isFocused: boolean }) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isFocused && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isFocused]);

  return (
    <Marker 
      position={[t.lat, t.lng]}
      icon={touristIcon}
      ref={markerRef}
    >
      <Popup>
        <div className="p-1 min-w-[150px]">
          <p className="font-bold text-base">{t.name}</p>
          <p className="text-xs text-muted-foreground mb-2">Live Tracking Active</p>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-medium uppercase">Connected</span>
          </div>
          <p className="text-[10px] italic border-t pt-2 mt-2">
            Last seen: {new Date(t.lastUpdate).toLocaleTimeString()}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

function IncidentMarker({ inc }: { inc: any }) {
  return (
    <Marker 
      position={[inc.latitude, inc.longitude]}
      icon={incidentIcon}
    >
      <Popup>
        <div className="p-1">
          <p className="font-bold text-red-600">{inc.type}</p>
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{inc.severity} SEVERITY</p>
          <p className="text-xs">{inc.description}</p>
          <p className="text-[10px] mt-2 italic">Reported: {new Date(inc.createdAt).toLocaleTimeString()}</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapComponent({ 
  center = [18.97, 72.82],
  zoom = 12,
  regionGeometry,
  liveTourists = [],
  incidents = [],
  focusedTouristId = null,
  focusCoords = null,
  layers = { tourists: true, officers: true, incidents: true },
  isDrawingMode = false,
  tempFenceCoords = [],
  onMapClick,
  activeGeofences = []
}: MapComponentProps) {
  const targetMarkerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (focusCoords && targetMarkerRef.current) {
        targetMarkerRef.current.openPopup();
    }
  }, [focusCoords]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return '#ef4444'; // red-500
      case 'HIGH': return '#f97316'; // orange-500
      case 'MEDIUM': return '#eab308'; // yellow-500
      default: return '#22c55e'; // green-500
    }
  }

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-inner bg-secondary/10 relative">
      <MapContainer 
        center={focusCoords ? [focusCoords.lat, focusCoords.lng] : center} 
        zoom={focusCoords ? 16 : zoom} 
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ResizeHandler regionGeometry={regionGeometry} />
        <FocusHandler liveTourists={liveTourists} focusedTouristId={focusedTouristId} />
        <CoordinateFocusHandler focusCoords={focusCoords} />
        <MapEventsHandler isDrawingMode={isDrawingMode} onMapClick={onMapClick} />
        
        {/* Draw Mode Tooltip (follows cursor conceptually, but here we just show dots) */}
        {isDrawingMode && tempFenceCoords.map((coord, i) => (
            <Marker key={`temp-${i}`} position={coord} icon={new L.DivIcon({ className: 'custom-div-icon', html: `<div style="background-color: #3b82f6; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`, iconSize: [10, 10], iconAnchor: [5, 5] })} />
        ))}

        {isDrawingMode && tempFenceCoords.length > 1 && (
            <Polygon 
                positions={tempFenceCoords} 
                pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '5, 5', fillColor: '#3b82f6', fillOpacity: 0.2 }} 
            />
        )}

        {/* Existing Geofences */}
        {!isDrawingMode && activeGeofences.filter(gf => gf.active).map(gf => {
            const color = getRiskColor(gf.riskLevel);
            let latSum = 0, lngSum = 0;
            gf.coordinates.forEach((c: any) => { latSum += c.lat; lngSum += c.lng; });
            const center: [number, number] = [latSum / gf.coordinates.length, lngSum / gf.coordinates.length];

            const pinIcon = new L.DivIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}80;"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });

            return (
                <React.Fragment key={gf.id}>
                    <Polygon 
                        positions={gf.coordinates.map((c: any) => [c.lat, c.lng])} 
                        pathOptions={{ 
                            color: color, 
                            weight: 2, 
                            fillColor: color, 
                            fillOpacity: 0.15 
                        }} 
                    >
                        <Popup>
                            <div className="font-bold">{gf.name}</div>
                            <div className="text-[10px] uppercase text-muted-foreground">{gf.type} • {gf.riskLevel} RISK</div>
                        </Popup>
                    </Polygon>
                    {/* Centroid Pin for zoomed out visibility */}
                    <Marker position={center} icon={pinIcon}>
                        <Popup>
                            <div className="font-bold">{gf.name}</div>
                            <div className="text-[10px] uppercase text-muted-foreground">{gf.type} • {gf.riskLevel} RISK</div>
                            <div className="text-[10px] italic mt-1 text-muted-foreground">Zone Centerpoint</div>
                        </Popup>
                    </Marker>
                </React.Fragment>
            );
        })}
        
        {regionGeometry && (
          <GeoJSON 
            data={regionGeometry} 
            style={{ 
              color: '#3b82f6', 
              weight: 2, 
              fillColor: '#3b82f6', 
              fillOpacity: 0.1 
            }} 
          />
        )}

        {layers.tourists && liveTourists.map((t) => (
          <TouristMarker key={t.id} t={t} isFocused={t.id === focusedTouristId} />
        ))}

        {layers.incidents && incidents.map((inc) => (
          <IncidentMarker key={inc.id} inc={inc} />
        ))}

        {focusCoords && (
            <Marker 
                position={[focusCoords.lat, focusCoords.lng]} 
                icon={touristIcon} 
                ref={targetMarkerRef}
            >
                <Popup>
                    <div className="p-1">
                        <p className="font-bold text-red-600">Incident Location</p>
                        <p className="text-sm">{focusCoords.label}</p>
                        <p className="text-[10px] mt-2 text-muted-foreground uppercase font-bold tracking-widest">Pinpointed from Report</p>
                    </div>
                </Popup>
            </Marker>
        )}
      </MapContainer>
    </div>
  )
}
