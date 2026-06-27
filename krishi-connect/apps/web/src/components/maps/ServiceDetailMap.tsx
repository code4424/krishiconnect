import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

interface ServiceDetailMapProps {
  lat: number;
  lng: number;
  price: string;
}

export function ServiceDetailMap({ lat, lng, price }: ServiceDetailMapProps) {
  const icon = L.divIcon({
    className: 'custom-price-marker',
    html: `<div class="bg-primary text-white px-3 py-1 rounded-xl font-black text-xs shadow-xl border-2 border-white ring-1 ring-primary/20">₹${price}</div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });

  return (
    <div className="h-[200px] w-full rounded-[2rem] overflow-hidden shadow-inner border border-gray-100 ring-1 ring-black/5">
      <MapContainer 
        center={[lat, lng]} 
        zoom={14} 
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} icon={icon} />
      </MapContainer>
    </div>
  );
}
