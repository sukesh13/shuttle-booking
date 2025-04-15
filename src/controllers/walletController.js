const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AdminPointAllocation = require('../models/AdminPointAllocation');

module.exports = {
    getBalance: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            res.json({balance: user.walletBalance});
        }
        catch(err) {
            console.error(err.message);
            res.status(500).json({message: 'Server error'});
        } 
    },

    getTransactions: async (req, res) => {
        try {
            const transactions = await Transaction.find({user_id: req.user.id})
            .sort({created_at: -1});
            res.json(transactions);
        }
        catch(err) {
            console.error(err.message);
            res.status(500).json({message: 'Server error'});
        }
    },

    // Admin: Add points to user's wallet
    addPoints: async (req, res) => {
        try {
            const {userId, amount, reason} = req.body;
            
            if(!userId || !amount || !reason) {
                return res.status(400).json({message: 'Incomplete data provided'});
            }
    
            if(amount <= 0) {
                return res.status(400).json({message: 'Invalid amount'});
            }
            console.log(req.user);
            const user = await User.findById(userId);
            if(!user) {
                return res.status(400).json({message: 'User not found'});
            }
    
            // Update user's wallet balance
            user.walletBalance += amount;
            await user.save();
            
            
            // Create Wallet Transaction record
            const transaction = new Transaction({
                user_id: userId,
                transaction_type: 'credit',
                amount,
                description: '[Added by admin : '+ req.user.id+ '] : ' + reason
            });
            await transaction.save();
    
            const allocation = new AdminPointAllocation({
                user_id: userId,
                allocated_points: amount,
                reason,
                allocated_by: req.user.id
            });
    
            await allocation.save();
    
            res.json({
                message: 'Points added successfully',
                newBalance: user.walletBalance,
                transaction
            });
        }
        catch(err) {
            console.error(err.message);
            res.status(500).json({message: 'Server error'});
        }
    },

    // Deduct points from wallet (for booking)
    deductPoints: async (req, res) => {
        try {
            const {id, amount, description} = req.body;
            console.log(req.body);
            
            if(!amount || !description) {
                return res.status(400).json({message: 'Incomplete data provided'});
            }
    
            if(amount <= 0) {
                return res.status(400).json({message: 'Invalid amount'});
            }
            
            const user = await User.findById(id);
            if(!user) {
                return res.status(400).json({message: 'User not found'});
            }
    
            if(user.walletBalance < amount) {
                return res.status(400).json({message: 'Insufficient balance'});
            }
    
            // Update user's wallet balance
            user.walletBalance -= amount;
            await user.save();
    
            // Create Wallet Transaction record
            const transaction = new Transaction({
                user_id: req.user.id,
                transaction_type: 'debit',
                amount,
                description: description
            });
            await transaction.save();
    
            res.json({
                message: 'Points deducted successfully',
                newBalance: user.walletBalance,
                transaction
            });
        }
        catch(err) {
            console.error(err.message);
            res.status(500).json({message: 'Server error'});
        }
    },

    // Allocate monthly/semester-based credits
    allocateCredits: async (req, res) => {
        const {userId, credits} = req.body;
        try {
            const user = await User.findById(userId);
            if(!user) {
                return res.status(400).json({message: 'User not found'});
            }

            user.monthlyCredits = credits;
            await user.save();
            res.json({message: 'Credits allocated successfully'}, user);
        }
        catch(err) {
            console.error(err.message);
            res.status(500).json({message: 'Server error'});
        }
    },

    // Add bonus points
    addBonusPoints: async (req, res) => {
        const {userId, points} = req.body;
        try {
            const user = await User.findById(userId);
            if(!user) {
                return res.status(400).json({message: 'User not found'});
            }

            user.bonusPoints += points;
            await user.save();
            res.json({message: 'Bonus points added successfully'}, user);
        }
        catch(err) {
            console.error(err.message);
            res.status(500).json({message: 'Server error'});
        }
    },

    // Deduct Bonus Points
    deductPoints: async (req, res) => {
        const {userId, points, reason} = req.body;
        try {
            const user = await User.findById(userId);
            if(!user) {
                return res.status(400).json({message: 'User not found'});
            }

            user.walletBalance -= points;
            if(user.walletBalance < 0) {
                user.walletBalance = 0; // prevent negative balance
            }
            await user.save();
            const allocation = new AdminPointAllocation({
                user_id: userId,
                allocated_points: points,
                reason,
                allocated_by: req.user.id
            });

            await allocation.save();
            res.json({message: 'Points deducted successfully'}, user);
        }
        catch(err) {
            console.error(err.message);
            res.status(500).json({message: 'Server error'});
        }
    },

    // Recharge wallet
    rechargeWallet: async (req, res) => {
        const { amount } = req.body;
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.walletBalance += amount;
            await user.save();
            res.json({ message: 'Wallet recharged successfully', newBalance: user.walletBalance });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Server error' });
        }
    },

    /*
        Section required further editing - pending for now
    */

    calculateFare: (baseFare, isPeakHour) => {
        return isPeakHour ? baseFare * 1.5 : baseFare * 0.75;
    },

    confirmBooking: async (req, res) => {
        const { bookingId, baseFare, isPeakHour } = req.body;
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const fare = calculateFare(baseFare, isPeakHour);
            if (user.walletBalance < fare) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }
            user.walletBalance -= fare;
            await user.save();
            res.json({ message: 'Booking confirmed', newBalance: user.walletBalance });
        } catch (err) {
            console.error(err.message);
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