const Shuttle = require('../models/Shuttle');

module.exports = {
    createShuttle: async (req, res) => {
        try {
            const { route_id, capacity, current_location } = req.body;
            const shuttle = new Shuttle({ route_id, capacity, current_location });
            await shuttle.save();
            res.status(201).json(shuttle);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    getAllShuttles: async (req, res) => {
        try {
            const shuttles = await Shuttle.find().populate('route_id');
            res.json(shuttles);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    getShuttleDetails: async (req, res) => {
        try {
            const shuttle = await Shuttle.findById(req.params.id).populate('route_id');
            if (!shuttle) {
                return res.status(404).json({ message: 'Shuttle not found' });
            }
            res.json(shuttle);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    updateShuttle: async (req, res) => {
        try {
            const { route_id, capacity, current_location, status } = req.body;
            const shuttle = await Shuttle.findByIdAndUpdate(req.params.id, { route_id, capacity, current_location, status }, { new: true });
            if (!shuttle) {
                return res.status(404).json({ message: 'Shuttle not found' });
            }
            res.json(shuttle);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    deleteShuttle: async (req, res) => {
        try {
            const shuttle = await Shuttle.findByIdAndDelete(req.params.id);
            if (!shuttle) {
                return res.status(404).json({ message: 'Shuttle not found' });
            }
            res.json({ message: 'Shuttle deleted successfully' });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },
    updateOccupancy: async (req, res) => {
        try {
            const { current_occupancy } = req.body;
            const shuttle = await Shuttle.findById(req.params.id);
            if (!shuttle) {
                return res.status(404).json({ message: 'Shuttle not found' });
            }
            if (current_occupancy > shuttle.capacity) {
                return res.status(400).json({ message: 'Current occupancy cannot exceed shuttle capacity' });
            }
            shuttle.current_occupancy = current_occupancy;
            await shuttle.save();
            res.json(shuttle);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },

    updateRealTimeTracking: async (req, res) => {
        try {
            const { shuttle_id, route_id, current_location, occupancy } = req.body;
            const tracking = new RealTimeTracking({ shuttle_id, route_id, current_location, occupancy });
            await tracking.save();
            res.status(201).json(tracking);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    }
};