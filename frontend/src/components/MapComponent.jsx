import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const LocationMarker = ({ position, label }) => {
  return position === null ? null : (
    <Marker position={position}>
      <Popup>{label || 'You are here'}</Popup>
    </Marker>
  );
};

const MapBoundsController = ({ userLocation, helperLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation && helperLocation) {
      const bounds = L.latLngBounds([userLocation, helperLocation]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (userLocation) {
      map.flyTo(userLocation, 15);
    } else if (helperLocation) {
      map.flyTo(helperLocation, 15);
    }
  }, [userLocation, helperLocation, map]);

  return null;
};

import RoutingMachine from './RoutingMachine';

const MapComponent = ({ userLocation, helperLocation }) => {
  const defaultCenter = [20.5937, 78.9629]; // India Center

  return (
    <MapContainer 
      center={userLocation || defaultCenter} 
      zoom={13} 
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBoundsController userLocation={userLocation} helperLocation={helperLocation} />
      
      {userLocation && helperLocation && (
        <RoutingMachine start={helperLocation} end={userLocation} />
      )}

      {userLocation && <LocationMarker position={userLocation} label="User in danger" />}
      {helperLocation && <LocationMarker position={helperLocation} label="Helper responding" />}
    </MapContainer>
  );
};

export default MapComponent;
