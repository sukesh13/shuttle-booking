const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({message: 'Access denied'});
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    }
    catch (error) {
        res.status(401).json({message: 'Invalid token'});
    }
}

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {        
        next();
    }
    else {
        res.status(403).json({message: 'Access denied. Admin only'});
    }
}

module.exports = {auth, isAdmin};