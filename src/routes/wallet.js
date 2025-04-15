const express = require('express');
const router = express.Router();
const {auth, isAdmin} = require('../middleware/auth');
const User = require('../models/User');
const walletController = require('../controllers/walletController');

const Transaction = require('../models/Transaction');
const AdminPointAllocation = require('../models/AdminPointAllocation');

// Wallet Operation
router.get('/balance', auth, walletController.getBalance);
router.get('/transactions', auth, walletController.getTransactions);

// Point addition/ deduction
router.post('/addPoints', auth, isAdmin, walletController.addPoints);
router.post('/deductPoints', auth, walletController.deductPoints);

// Bonus and Credit System for Points
router.post('/allocateCredits', auth, isAdmin, walletController.allocateCredits);
router.post('/addBonusPoints', auth, isAdmin, walletController.addBonusPoints);
router.post('/deductPoints', auth, walletController.deductPoints);


// Recharge and deduction on booking
router.post('/recharge', auth, walletController.rechargeWallet);
router.post('/confirmBooking', auth, walletController.confirmBooking);
// Expense Tracking & Wallet Statements
router.get('/expense-report', auth, walletController.getExpenseReport);

module.exports = router;