const Route = require('../models/Route');
const Stop = require('../models/Stop');
const { createRoute, suggestStops, getOptimalRoute, handleTransfer } = require('../util/routeUtils');

module.exports = {
    createRoute: async (req, res) => {
        try {
            const route = await createRoute(req.body);
            res.status(201).json(route);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    getAllRoutes: async (req, res) => {
        try {
            const routes = await Route.find().populate('stops');
            res.json(routes);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    getRouteDetails: async (req, res) => {
        try {
            const route = await Route.findById(req.params.id).populate('stops');
            if (!route) {
                return res.status(404).json({ message: 'Route not found' });
            }
            res.json(route);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    updateRoute: async (req, res) => {
        try {
            const { route_name, stops, peak_hours, demand_level } = req.body;
            const route = await Route.findByIdAndUpdate(req.params.id, { route_name, stops, peak_hours, demand_level }, { new: true });
            if (!route) {
                return res.status(404).json({ message: 'Route not found' });
            }
            res.json(route);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    deleteRoute: async (req, res) => {
        try {
            const route = await Route.findByIdAndDelete(req.params.id);
            if (!route) {
                return res.status(404).json({ message: 'Route not found' });
            }
            res.json({ message: 'Route deleted successfully' });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    addStop: async (req, res) => {
        try {
            const { name, latitude, longitude, order } = req.body;
            const stop = new Stop({ name, latitude, longitude, order });
            await stop.save();
            const route = await Route.findById(req.params.id);
            if (!route) {
                return res.status(404).json({ message: 'Route not found' });
            }
            route.stops.push(stop);
            await route.save();
            res.status(201).json(stop);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    updateStop: async (req, res) => {
        try {
            const { name, latitude, longitude, order } = req.body;
            const stop = await Stop.findByIdAndUpdate(req.params.stopId, { name, latitude, longitude, order }, { new: true });
            if (!stop) {
                return res.status(404).json({ message: 'Stop not found' });
            }
            res.json(stop);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    removeStop: async (req, res) => {
        try {
            const route = await Route.findById(req.params.id);
            if (!route) {
                return res.status(404).json({ message: 'Route not found' });
            }
            route.stops.pull(req.params.stopId);
            await route.save();
            await Stop.findByIdAndDelete(req.params.stopId);
            res.json({ message: 'Stop removed successfully' });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    getStops: async (req, res) => {
        try {
            const route = await Route.findById(req.params.id).populate('stops');
            if (!route) {
                return res.status(404).json({ message: 'Route not found' });
            }
            res.json(route.stops);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    updatePeakHours: async (req, res) => {
        try {
            const { start_time, end_time } = req.body;
            const route = await Route.findByIdAndUpdate(req.params.id, { peak_hours: { start_time, end_time } }, { new: true });
            if (!route) {
                return res.status(404).json({ message: 'Route not found' });
            }
            res.json(route);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    updateDemandLevel: async (req, res) => {
        try {
            const { demand_level } = req.body;
            const route = await Route.findByIdAndUpdate(req.params.id, { demand_level }, { new: true });
            if (!route) {
                return res.status(404).json({ message: 'Route not found' });
            }
            res.json(route);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    suggestStops: async (req, res) => {
        try {
            const { currentLocation, preferredDepartureTime, historicalData } = req.body;
            const stops = await suggestStops(currentLocation, preferredDepartureTime, historicalData);
            res.json(stops);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    getOptimalRoute: async (req, res) => {
        try {
            const { srcStopId, destStopId, criteria } = req.query;
            const route = await getOptimalRoute(srcStopId, destStopId, criteria);
            res.json(route);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    handleTransfer: async (req, res) => {
        try {
            const { userId, initialRouteId, transferStopId, finalRouteId, pointsAdjustment } = req.body;
            const transferRoute = await handleTransfer(userId, initialRouteId, transferStopId, finalRouteId, pointsAdjustment);
            res.json(transferRoute);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },


    getTripHistory: async (req, res) => {
        try {
            const bookings = await Booking.find({ user_id: req.user.id }).populate('start_stop_id end_stop_id route_id');
            res.json(bookings);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getFrequentRoutes: async (req, res) => {
        try {
            const bookings = await Booking.aggregate([
                { $match: { user_id: req.user.id } },
                { $group: { _id: "$route_id", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);
            res.json(bookings);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getExpenseReport: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const bookings = await Booking.find({
                user_id: req.user.id,
                booking_time: { $gte: new Date(startDate), $lte: new Date(endDate) }
            });

            const totalPointsUsed = bookings.reduce((total, booking) => total + booking.points_deducted, 0);

            res.json({
                totalPointsUsed,
                bookings
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    }
};