import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Guide } from '../types';
import L from 'leaflet';
import Button from './common/Button';
import StarRating from './StarRating';
import LazyImage from './common/LazyImage';

// Fix for default Leaflet icon not showing up
// This is a known issue with bundlers and react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


interface MapSearchViewProps {
  guides: Guide[];
  onMarkerClick: (guide: Guide) => void;
}

const MapMarkerPopup: React.FC<{ guide: Guide; onViewDetails: () => void }> = ({ guide, onViewDetails }) => (
  <div className="w-56">
    <LazyImage src={guide.avatarUrl} alt={guide.name} className="h-28 w-full rounded-t-lg" placeholderClassName="rounded-t-lg" />
    <div className="p-2">
      <h3 className="font-bold text-base text-dark dark:text-light">{guide.name}</h3>
      <div className="flex items-center text-sm">
        <StarRating rating={guide.rating} />
        <span className="ml-1 text-gray-600 dark:text-gray-400">({guide.reviewCount})</span>
      </div>
      <Button size="sm" onClick={onViewDetails} className="w-full mt-2">
        View Details
      </Button>
    </div>
  </div>
);

const MapSearchView: React.FC<MapSearchViewProps> = ({ guides, onMarkerClick }) => {
  const mapCenter: [number, number] = [19.7515, 75.7139]; // Approx center of Maharashtra

  return (
    <MapContainer center={mapCenter} zoom={7} scrollWheelZoom={true} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {guides.map(guide => (
        <Marker key={guide.id} position={[guide.coordinates.lat, guide.coordinates.lng]}>
          <Popup>
            <MapMarkerPopup guide={guide} onViewDetails={() => onMarkerClick(guide)} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapSearchView;