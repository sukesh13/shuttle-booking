const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Shuttle = require('../models/Shuttle');
const RealTimeTracking = require('../models/RealTimeTracking');
const TransferRoute = require('../models/TransferRoute');
const Booking = require('../models/Booking');

const createRoute = async (routeData) => {
  const { route_name, stops, peak_hours, demand_level } = routeData;

  // Create stops and calculate distances
  const stopIds = [];
  for (let i = 0; i < stops.length; i++) {
    const stopData = stops[i];
    let stop = await Stop.findOne({ name: stopData.name });

    if (!stop) {
      stop = new Stop(stopData);
      await stop.save();
    }

    stopIds.push(stop._id);

    // Add route ID to stop's routes array if not already present
    if (!stop.routes.includes(route._id)) {
      stop.routes.push(route._id);
      await stop.save();
    }

    // Add neighbors to the stop
    if (i > 0) {
      const previousStop = await Stop.findById(stopIds[i - 1]);
      const distance = calculateDistance(previousStop, stop);
      stop.neighbors.push({ stop_id: previousStop._id, route_id: route._id, distance });
      previousStop.neighbors.push({ stop_id: stop._id, route_id: route._id, distance });
      await stop.save();
      await previousStop.save();
    }
  }

  // Create route with stops and distances
  const routeStops = stopIds.map((stop_id, index) => ({
    stop_id,
    distance_traveled: stops[index].distance_traveled
  }));

  const route = new Route({ route_name, stops: routeStops, peak_hours, demand_level });
  await route.save();

  return route;
};

const calculateDistance = (stop1, stop2) => {
  return Math.sqrt(Math.pow(stop2.latitude - stop1.latitude, 2) + Math.pow(stop2.longitude - stop1.longitude, 2));
};

const findBestRouteByTime = async (srcStopId, destStopId) => {
  const stops = await Stop.find().populate('neighbors.stop_id');
  const stopMap = new Map(stops.map(stop => [stop._id.toString(), stop]));

  const distances = new Map();
  const previousStops = new Map();
  const unvisitedStops = new Set(stopMap.keys());

  distances.set(srcStopId, 0);

  while (unvisitedStops.size > 0) {
    const currentStopId = getClosestStop(unvisitedStops, distances);
    if (currentStopId === destStopId) break;

    const currentStop = stopMap.get(currentStopId);
    for (const neighbor of currentStop.neighbors) {
      const neighborStopId = neighbor.stop_id.toString();
      if (!unvisitedStops.has(neighborStopId)) continue;

      const newDistance = distances.get(currentStopId) + neighbor.distance;
      if (newDistance < (distances.get(neighborStopId) || Infinity)) {
        distances.set(neighborStopId, newDistance);
        previousStops.set(neighborStopId, currentStopId);
      }
    }

    unvisitedStops.delete(currentStopId);
  }

  const route = [];
  let currentStopId = destStopId;
  while (currentStopId) {
    route.unshift(currentStopId);
    currentStopId = previousStops.get(currentStopId);
  }

  return route;
};

const findBestRouteByExchanges = async (srcStopId, destStopId) => {
  const stops = await Stop.find().populate('neighbors.stop_id');
  const stopMap = new Map(stops.map(stop => [stop._id.toString(), stop]));

  const exchanges = new Map();
  const previousStops = new Map();
  const unvisitedStops = new Set(stopMap.keys());

  exchanges.set(srcStopId, 0);

  while (unvisitedStops.size > 0) {
    const currentStopId = getClosestStopByExchanges(unvisitedStops, exchanges);
    if (currentStopId === destStopId) break;

    const currentStop = stopMap.get(currentStopId);
    for (const neighbor of currentStop.neighbors) {
      const neighborStopId = neighbor.stop_id.toString();
      if (!unvisitedStops.has(neighborStopId)) continue;

      const newExchanges = exchanges.get(currentStopId) + (currentStop.routes.includes(neighbor.route_id) ? 0 : 1);
      if (newExchanges < (exchanges.get(neighborStopId) || Infinity)) {
        exchanges.set(neighborStopId, newExchanges);
        previousStops.set(neighborStopId, currentStopId);
      }
    }

    unvisitedStops.delete(currentStopId);
  }

  const route = [];
  let currentStopId = destStopId;
  while (currentStopId) {
    route.unshift(currentStopId);
    currentStopId = previousStops.get(currentStopId);
  }

  return route;
};

const getClosestStop = (unvisitedStops, distances) => {
  let closestStop = null;
  let minDistance = Infinity;
  for (const stopId of unvisitedStops) {
    const distance = distances.get(stopId) || Infinity;
    if (distance < minDistance) {
      closestStop = stopId;
      minDistance = distance;
    }
  }
  return closestStop;
};

const getClosestStopByExchanges = (unvisitedStops, exchanges) => {
  let closestStop = null;
  let minExchanges = Infinity;
  for (const stopId of unvisitedStops) {
    const exchange = exchanges.get(stopId) || Infinity;
    if (exchange < minExchanges) {
      closestStop = stopId;
      minExchanges = exchange;
    }
  }
  return closestStop;
};

const suggestStops = async (currentLocation, preferredDepartureTime, historicalData) => {
  const stops = await Stop.find();
  const closestStops = stops.map(stop => ({
    stop,
    distance: calculateDistance(currentLocation, stop)
  })).sort((a, b) => a.distance - b.distance);

  return closestStops.slice(0, 3); // Return top 3 closest stops
};

const getOptimalRoute = async (srcStopId, destStopId, criteria = 'time') => {
  let route;
  if (criteria === 'time') {
    route = await findBestRouteByTime(srcStopId, destStopId);
  } else if (criteria === 'exchanges') {
    route = await findBestRouteByExchanges(srcStopId, destStopId);
  }
  return route;
};

const handleTransfer = async (userId, initialRouteId, transferStopId, finalRouteId, pointsAdjustment) => {
  const transferRoute = new TransferRoute({
    user_id: userId,
    initial_route_id: initialRouteId,
    transfer_stop_id: transferStopId,
    final_route_id: finalRouteId,
    points_adjustment: pointsAdjustment
  });
  await transferRoute.save();
  return transferRoute;
};

module.exports = {
  createRoute,
  findBestRouteByTime,
  findBestRouteByExchanges,
  suggestStops,
  getOptimalRoute,
  handleTransfer
};