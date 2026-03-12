import Helper from '../models/Helper.js';
import SOSRequest from '../models/SOSRequest.js';

export const findNearestHelpers = async (userLng, userLat, limit = 5, excludeIds = []) => {
  const MAX_DISTANCE_METERS = 5000; // 5km search radius

  // Convert to specific Number types if they aren't already to avoid Mongo Type Errors
  const lng = Number(userLng);
  const lat = Number(userLat);

  const activeHelpers = await Helper.find({
    _id: { $nin: excludeIds },
    availabilityStatus: true,
    isOnline: true,
    verificationStatus: 'verified',
    currentLocation: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: MAX_DISTANCE_METERS
      }
    }
  }).limit(limit).populate('userId', 'name phone');

  console.log(`[DEBUG] Geospatial match found: ${activeHelpers.length} helpers`);

  if (activeHelpers.length === 0) {
     const allHelpers = await Helper.find({});
     console.log("[DEBUG] Total Helpers in DB:", allHelpers.length);
     console.log("[DEBUG] A Sample Helper:", JSON.stringify(allHelpers[allHelpers.length - 1], null, 2));
  }

  return activeHelpers;
};

export const triggerSOSMatch = async (userId, lng, lat) => {
  const nearbyHelpers = await findNearestHelpers(lng, lat);
  
  // Create SOS Record
  const sos = new SOSRequest({
    userId,
    location: { type: "Point", coordinates: [lng, lat] },
    status: 'active',
    notifiedHelpers: nearbyHelpers.map(h => h._id),
    expiresAt: new Date(Date.now() + 2 * 60000) // 2 minute timeout
  });
  
  await sos.save();

  return { sos, helpersToNotify: nearbyHelpers };
};
