import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { farmerIcon } from './utils/icons';
import { Button } from '../ui/button';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Input } from '../ui/input';

interface LocationPickerProps {
  initialLat: number;
  initialLng: number;
  onConfirm: (lat: number, lng: number, address: string) => void;
}

function RecenterMap({ pos }: { pos: L.LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(pos, map.getZoom());
  }, [pos, map]);
  return null;
}

export function LocationPicker({ initialLat, initialLng, onConfirm }: LocationPickerProps) {
  const [pos, setPos] = useState<L.LatLng>(new L.LatLng(initialLat, initialLng));
  const [address, setAddress] = useState('Loading address...');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await api.get('/geocode/reverse', { params: { lat, lng } });
      setAddress(res.data.data.display_name || 'Address not found');
    } catch (e) {
      setAddress('Error fetching address');
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPos(e.latlng);
        fetchAddress(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const handleSearch = async () => {
    if (!search) return;
    setIsGeocoding(true);
    try {
      const res = await api.get('/geocode/search', { params: { q: search } });
      if (res.data.data[0]) {
        const { lat, lon, display_name } = res.data.data[0];
        const newPos = new L.LatLng(Number(lat), Number(lon));
        setPos(newPos);
        setAddress(display_name);
      }
    } catch (e) {
      setAddress('Search failed');
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400">
            <Search className="w-4 h-4" />
        </div>
        <Input
          className="pl-11 h-12 rounded-2xl bg-white shadow-sm border ring-1 ring-black/5"
          placeholder="Search village, city, or pincode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} size="sm" className="absolute right-1.5 top-1.5 h-9 rounded-xl bg-primary">Search</Button>
      </div>

      <div className="h-[300px] sm:h-[350px] rounded-2xl overflow-hidden shadow-lg relative border border-gray-200">
        <MapContainer center={pos} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={pos} icon={farmerIcon} draggable eventHandlers={{
            dragend: (e: any) => {
              const marker = e.target;
              const position = marker.getLatLng();
              setPos(position);
              fetchAddress(position.lat, position.lng);
            }
          }} />
          <MapEvents />
          <RecenterMap pos={pos} />
        </MapContainer>

        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl z-[1000] border border-white flex gap-3 items-center">
           <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <MapPin className="w-4 h-4" />
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Selected Location</p>
              <p className="text-xs font-bold text-gray-900 truncate">{isGeocoding ? 'Fetching address...' : address}</p>
           </div>
           {isGeocoding && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>
      </div>

      <Button
        onClick={() => onConfirm(pos.lat, pos.lng, address)}
        disabled={isGeocoding}
        className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-dark font-black uppercase tracking-widest shadow-lg shadow-primary/20"
      >
        Confirm Location
      </Button>
    </div>
  );
}
