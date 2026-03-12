import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MapComponent from '../components/MapComponent';
import { Navigation, BellRing, LogOut, CheckCircle2 } from 'lucide-react';

const HelperDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [helperLocation, setHelperLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeSOS, setActiveSOS] = useState(null);
  const [isAssigned, setIsAssigned] = useState(false);
  const [incomingAlerts, setIncomingAlerts] = useState([]);

  // Monitor Helper Location via GPS
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          setHelperLocation([latitude, longitude]);
          if (socket) {
            socket.emit('helper:update_location', { lng: longitude, lat: latitude });
          }
        },
        (err) => console.error("Helper location error:", err),
        { enableHighAccuracy: true }
      );
    }
    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    socket.on('sos:alert', (data) => {
      // Receiver of alert from matching service
      setIncomingAlerts((prev) => [...prev, data]);
      // Show victim location on map immediately
      if (data.location) {
        setUserLocation([data.location.lat, data.location.lng]);
      }
    });

    socket.on('sos:success', (data) => {
      // I successfully claimed the SOS
      setActiveSOS(data.sos);
      setIsAssigned(true);
      setUserLocation([data.sos.location.coordinates[1], data.sos.location.coordinates[0]]); // [lat, lng]
      setIncomingAlerts([]); // Clear other alerts for now
    });

    socket.on('sos:error', (data) => {
      // Failed to claim or SOS cancelled mid-air
      alert(data.message);
      setIncomingAlerts((prev) => prev.filter(alert => alert.sosId !== data.sosId))
    });

    socket.on('sos:location_update', (data) => {
      // User is moving
      if (data.userId !== user._id) {
        setUserLocation([data.lat, data.lng]);
      }
    });

    socket.on('sos:cancelled', () => {
      setActiveSOS(null);
      setIsAssigned(false);
      setUserLocation(null);
      alert('The SOS request has been cancelled by the user.');
    });

    socket.on('sos:resolved', () => {
      setActiveSOS(null);
      setIsAssigned(false);
      setUserLocation(null);
      alert('The user has marked the situation as resolved. Thank you for your help! You are now available for other requests.');
    });

    return () => {
      socket.off('sos:alert');
      socket.off('sos:success');
      socket.off('sos:error');
      socket.off('sos:location_update');
      socket.off('sos:cancelled');
      socket.off('sos:resolved');
    };
  }, [socket, user._id]);

  // Haversine distance in km
  const getDistance = (loc1, loc2) => {
    if (!loc1 || !loc2) return null;
    const R = 6371;
    const dLat = (loc2[0] - loc1[0]) * Math.PI / 180;
    const dLon = (loc2[1] - loc1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1[0] * Math.PI / 180) * Math.cos(loc2[0] * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
  };

  const acceptSOS = (sosId) => {
    if (socket) {
      socket.emit('sos:accept', { sosId });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-textMain">Responder Dashboard</h1>
          <p className="text-sm text-success flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success"></span> Online & Available
          </p>
        </div>
        <button onClick={logout} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <LogOut size={24} />
        </button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 h-[calc(100vh-140px)]">
        
        {/* Alerts / Status Panel */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm p-6 overflow-y-auto border border-gray-100">
          {!isAssigned ? (
            <>
              <h2 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                <BellRing size={20} className="text-primary" /> Incoming Alerts
              </h2>
              {incomingAlerts.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                  <p>No active emergencies nearby.</p>
                  <p className="text-sm mt-2">Make sure your location services are enabled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingAlerts.map((alertData) => {
                    const dist = helperLocation && alertData.location
                      ? getDistance(helperLocation, [alertData.location.lat, alertData.location.lng])
                      : null;
                    return (
                    <div key={alertData.sosId} className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-danger/20 rounded-full flex items-center justify-center text-danger animate-pulse">
                          <BellRing size={22} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-danger text-lg">Emergency Nearby!</p>
                          {dist && <p className="text-sm text-gray-600 font-medium">~{dist} km away</p>}
                          {alertData.location && (
                            <p className="text-xs text-gray-500 mt-1">
                              Location: {alertData.location.lat?.toFixed(4)}, {alertData.location.lng?.toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => acceptSOS(alertData.sosId)}
                        className="w-full py-3 bg-danger text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-colors shadow-sm"
                      >
                        Accept & Respond
                      </button>
                    </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col h-full justify-between">
              <div>
                 <div className="bg-green-50 p-4 rounded-2xl border border-green-100 mb-6 flex flex-col items-center">
                    <CheckCircle2 size={40} className="text-success mb-2" />
                    <h2 className="text-lg font-bold text-textMain text-center">Response Confirmed</h2>
                    <p className="text-sm text-gray-600 text-center">Please proceed to the user's location immediately.</p>
                 </div>
                 <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Navigation className="text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Live Tracking Active</h3>
                      <p className="text-sm text-gray-500">The map is receiving real-time GPS updates from the user.</p>
                    </div>
                 </div>
              </div>
              <p className="text-xs text-center text-gray-400">Remember to stay calm and ensure your own safety while assisting.</p>
            </div>
          )}
        </div>

        {/* Map Panel */}
        <div className="flex-[2] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 min-h-[300px]">
           <MapComponent userLocation={userLocation} helperLocation={helperLocation} />
        </div>
      </div>
    </div>
  );
};

export default HelperDashboard;
