import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { useMap } from 'react-leaflet';

const RoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      // Customize the route line visually
      lineOptions: {
        styles: [{ color: '#fca5a5', opacity: 0.9, weight: 6 }] 
      },
      // Do not create default markers since MapComponent has custom ones
      createMarker: () => null 
    }).addTo(map);

    return () => {
       if (map && routingControl) {
          try {
             map.removeControl(routingControl);
          } catch (e) {
             console.log("Routing clear error", e);
          }
       }
    };
  }, [map, start, end]);

  return null;
};

export default RoutingMachine;
