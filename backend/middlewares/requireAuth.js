const jwt = require('jsonwebtoken');

//middleware per ottenere l'userId dai cookies
const requireAuth = (req, res, next) => {
    const token = req.cookies.session_token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Non autenticato' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Token non valido' });
    }
};

module.exports = requireAuth;