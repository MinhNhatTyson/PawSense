import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Leaflet's default marker icons reference image paths that break under
// bundlers like Vite — re-point them at the imported, bundled assets.
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  onChange: (lat: number, lng: number) => void
  height?: number
}

const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009] // Ho Chi Minh City fallback

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({ latitude, longitude, onChange, height = 280 }: LocationPickerProps) {
  const hasPosition = latitude !== null && longitude !== null
  const center: [number, number] = hasPosition ? [latitude!, longitude!] : DEFAULT_CENTER

  const handleMarkerDrag = useCallback(
    (e: L.DragEndEvent) => {
      const { lat, lng } = e.target.getLatLng()
      onChange(lat, lng)
    },
    [onChange]
  )

  return (
    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--warm-white)' }}>
      <MapContainer
        center={center}
        zoom={hasPosition ? 14 : 11}
        style={{ height, width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {hasPosition && (
          <Marker
            position={[latitude!, longitude!]}
            icon={pinIcon}
            draggable
            eventHandlers={{ dragend: handleMarkerDrag }}
          />
        )}
      </MapContainer>
    </div>
  )
}