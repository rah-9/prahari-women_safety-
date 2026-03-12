import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { triggerSOS, cancelSOS, resolveSOS } from '../services/sosService';
import MapComponent from '../components/MapComponent';
import { ShieldAlert, XCircle, LogOut, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [activeSOS, setActiveSOS] = useState(null);
  const [assignedHelper, setAssignedHelper] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [helperLocation, setHelperLocation] = useState(null);
  const [error, setError] = useState('');
  const [loadingSOS, setLoadingSOS] = useState(false);

  // 1. Get continuous user location
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          
          // Emit location if SOS is active and assigned
          if (socket && activeSOS && assignedHelper) {
            socket.emit('sos:update_location', { sosId: activeSOS._id, lng: longitude, lat: latitude });
          }
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }
    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, activeSOS, assignedHelper]);

  // 2. Listen to Socket Events
  useEffect(() => {
    if (!socket) return;

    socket.on('sos:assigned', (data) => {
      setAssignedHelper(data.helper);
      setActiveSOS(data.sos);
      if (data.helper?.currentLocation?.coordinates) {
        setHelperLocation([
          data.helper.currentLocation.coordinates[1], 
          data.helper.currentLocation.coordinates[0]
        ]);
      }
      // Join the room implicitly or explicitly if needed
      socket.emit('sos:join_room', { sosId: data.sos._id });
    });

    socket.on('sos:location_update', (data) => {
      // If the incoming location is NOT mine, it must be the helper
      if (data.userId !== user._id) {
         setHelperLocation([data.lat, data.lng]);
      }
    });

    socket.on('sos:cancelled', () => {
      setActiveSOS(null);
      setAssignedHelper(null);
      setHelperLocation(null);
      setError('SOS was cancelled.');
    });

    socket.on('sos:resolved', () => {
      setActiveSOS(null);
      setAssignedHelper(null);
      setHelperLocation(null);
      setError('SOS was resolved successfully.');
    });

    return () => {
      socket.off('sos:assigned');
      socket.off('sos:location_update');
      socket.off('sos:cancelled');
      socket.off('sos:resolved');
    };
  }, [socket, user._id]);

  const handleTriggerSOS = async () => {
    if (!userLocation) {
      setError('Waiting for GPS location...');
      return;
    }
    setLoadingSOS(true);
    setError('');
    try {
      const data = await triggerSOS(userLocation[1], userLocation[0]); // [lng, lat]
      setActiveSOS(data.sos);
    } catch (err) {
      setError('Failed to trigger SOS. Please call emergency numbers.');
    } finally {
      setLoadingSOS(false);
    }
  };

  const handleCancelSOS = async () => {
    if (!activeSOS) return;
    try {
      await cancelSOS(activeSOS._id);
      setActiveSOS(null);
      setAssignedHelper(null);
      setHelperLocation(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveSOS = async () => {
    if (!activeSOS) return;
    try {
      await resolveSOS(activeSOS._id);
      setActiveSOS(null);
      setAssignedHelper(null);
      setHelperLocation(null);
      setError('You marked the SOS as resolved. Stay safe!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-4">
        <div>
          <h1 className="text-xl font-bold text-textMain">Stay Safe, {user.name}</h1>
          <p className="text-sm text-gray-500">Prahari Network Active</p>
        </div>
        <button onClick={logout} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <LogOut size={24} />
        </button>
      </header>

      {error && (
        <div className="bg-red-50 text-danger p-4 rounded-2xl mb-4 text-center text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 h-[calc(100vh-140px)]">
        
        {/* Map Section */}
        <div className="flex-[2] bg-white rounded-3xl overflow-hidden shadow-sm relative min-h-[300px]">
           <MapComponent userLocation={userLocation} helperLocation={helperLocation} />
        </div>

        {/* Action Section */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-center items-center">
          
          {/* Status Panel when active */}
          {activeSOS ? (
            <div className="w-full flex flex-col items-center">
              {!assignedHelper ? (
                <div className="text-center mb-8 animate-pulse">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 text-orange-500 rounded-full mb-4">
                    <ShieldAlert size={40} />
                  </div>
                  <h2 className="text-xl font-bold text-textMain">Alert Sent!</h2>
                  <p className="text-gray-500 mt-2">Searching for the nearest verified helper...</p>
                </div>
              ) : (
                <div className="text-center w-full bg-green-50 p-6 rounded-3xl border border-green-100 mb-8">
                  <CheckCircle2 size={40} className="text-success mx-auto mb-2" />
                  <h2 className="text-xl font-bold text-textMain">Help is on the way</h2>
                  <div className="mt-4 bg-white p-5 rounded-2xl shadow-sm flex flex-col gap-4 text-left border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                        {assignedHelper.name ? assignedHelper.name[0].toUpperCase() : 'H'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-textMain">{assignedHelper?.name || 'Verified Responder'}</h3>
                        <p className="text-sm text-gray-500 capitalize">{assignedHelper?.gender?.replace(/_/g, ' ') || 'Helper'} • ID: {assignedHelper?._id?.substring(0,6).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Contact Number</p>
                        <p className="font-semibold text-textMain text-lg">{assignedHelper?.phone || 'Hidden'}</p>
                      </div>
                      <a href={`tel:${assignedHelper?.phone}`} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow hover:bg-primary/90 transition-colors">
                        Call Helper
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 w-full max-w-xs">
                {assignedHelper && (
                  <button 
                    onClick={handleResolveSOS}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-success text-white rounded-xl shadow hover:bg-green-600 transition-colors font-bold text-lg w-full"
                  >
                    <CheckCircle2 size={24} /> Helper Arrived
                  </button>
                )}
                <button 
                  onClick={handleCancelSOS}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm w-full"
                >
                  <XCircle size={18} /> Cancel Request
                </button>
              </div>
            </div>
          ) : (
            /* SOS Button */
            <div className="flex flex-col items-center justify-center h-full">
              <button
                onClick={handleTriggerSOS}
                disabled={loadingSOS || !userLocation}
                className={`
                  relative group w-48 h-48 rounded-full shadow-lg flex items-center justify-center
                  text-white font-bold text-4xl tracking-wider transition-all transform active:scale-95
                  bg-gradient-to-tr from-danger to-pink-500 hover:shadow-red-500/30 hover:shadow-2xl
                  ${(!userLocation || loadingSOS) ? 'opacity-70 cursor-not-allowed' : ''}
                `}
              >
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-danger"></div>
                SOS
              </button>
              <p className="text-gray-400 mt-6 text-sm flex items-center gap-2">
                Press in case of emergency
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
