const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const routeController = require('../controllers/routeController');
const shuttleController = require('../controllers/shuttleController');

// Routes Management
router.post('/', auth, isAdmin, routeController.createRoute);
router.get('/', auth, isAdmin, routeController.getAllRoutes);
router.get('/:id', auth, isAdmin, routeController.getRouteDetails);
router.put('/:id', auth, isAdmin, routeController.updateRoute);
router.delete('/:id', auth, isAdmin, routeController.deleteRoute);

// Stop Management
router.post('/:id/stops', auth, isAdmin, routeController.addStop);
router.put('/:id/stops/:stopId', auth, isAdmin, routeController.updateStop);
router.delete('/:id/stops/:stopId', auth, isAdmin, routeController.removeStop);
router.get('/:id/stops', auth, isAdmin, routeController.getStops);

// Route Optimization
router.put('/:id/peak-hours', auth, isAdmin, routeController.updatePeakHours);
router.put('/:id/demand-level', auth, isAdmin, routeController.updateDemandLevel);

// Shuttle Management
router.post('/shuttles', auth, isAdmin, shuttleController.createShuttle);
router.get('/shuttles', auth, isAdmin, shuttleController.getAllShuttles);
router.get('/shuttles/:id', auth, isAdmin, shuttleController.getShuttleDetails);
router.put('/shuttles/:id', auth, isAdmin, shuttleController.updateShuttle);
router.delete('/shuttles/:id', auth, isAdmin, shuttleController.deleteShuttle);
router.put('/shuttles/:id/occupancy', auth, isAdmin, shuttleController.updateOccupancy);
router.put('/shuttles/:id/real-time-tracking', auth, isAdmin, shuttleController.updateRealTimeTracking);


// Route Suggestion
router.post('/suggest-stops', auth, routeController.suggestStops);
router.get('/suggest-route', auth, routeController.getOptimalRoute);

// Handle Transfer
router.post('/handle-transfer', auth, routeController.handleTransfer);

// Trip History & Booking Records
router.get('/trip-history', auth, routeController.getTripHistory);
router.get('/frequent-routes', auth, routeController.getFrequentRoutes);
router.get('/expense-report', auth, routeController.getExpenseReport);


module.exports = router;