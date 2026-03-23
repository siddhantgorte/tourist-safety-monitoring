"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icon issues in Next.js/Webpack
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png"
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"

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
  layers?: {
    tourists: boolean
    officers: boolean
    incidents: boolean
  }
}

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

// Helper component to handle window resize and map invalidation
function ResizeHandler({ regionGeometry }: { regionGeometry?: any }) {
  const map = useMap()
  
  useEffect(() => {
    // Aggressive invalidation strategy to handle dynamic loading
    const invalidationTimes = [100, 500, 1000, 2000]
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

    // Handle window resize events
    const handleResize = () => {
      map.invalidateSize()
    }

    window.addEventListener("resize", handleResize)
    
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener("resize", handleResize)
    }
  }, [map, regionGeometry])
  
  return null
}

export default function MapComponent({ 
  center = [18.97, 72.82], // Default to Mumbai/Maharashtra region
  zoom = 6,
  regionGeometry,
  liveTourists = [],
  incidents = [],
  focusedTouristId = null,
  layers = { tourists: true, officers: true, incidents: true }
}: MapComponentProps) {
  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-inner bg-secondary/10 relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
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
          <Marker 
            key={t.id} 
            position={[t.lat, t.lng]}
            icon={touristIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground">Live Tracking Active</p>
                <p className="text-[10px] italic">Last update: {new Date(t.lastUpdate).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {layers.incidents && incidents.map((inc) => (
          <Marker 
            key={inc.id} 
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
        ))}
      </MapContainer>
    </div>
  )
}
