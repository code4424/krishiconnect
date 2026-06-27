import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { farmerIcon, providerIcon } from './utils/icons';

interface BookingTrackingMapProps {
  farmerPos: [number, number];
  providerPos: [number, number];
  providerAvatar?: string;
  status: string;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export function BookingTrackingMap({ farmerPos, providerPos, providerAvatar, status }: BookingTrackingMapProps) {
  const [currentProviderPos, setCurrentProviderPos] = useState(providerPos);

  // Smooth animation simulation
  useEffect(() => {
    setCurrentProviderPos(providerPos);
  }, [providerPos]);

  return (
    <MapContainer 
      center={farmerPos} 
      zoom={13} 
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapResizer />
      
      {/* Farmer Marker */}
      <Marker position={farmerPos} icon={farmerIcon}>
        <Popup>Your Location</Popup>
      </Marker>

      {/* Provider Marker */}
      <Marker position={currentProviderPos} icon={providerIcon(providerAvatar)}>
        <Popup>Provider is {status.toLowerCase().replace('_', ' ')}</Popup>
      </Marker>

      {/* Route Line */}
      <Polyline 
        positions={[farmerPos, currentProviderPos]} 
        color="#16a34a" 
        weight={4} 
        dashArray="10, 10" 
        opacity={0.6} 
      />
    </MapContainer>
  );
}
