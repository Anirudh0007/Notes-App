const jwt=require('jsonwebtoken');
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(401);  // Prevents further execution if the token is invalid
        }
        req.user = user;  // Correctly set the user object on req
        next();
    });
}


module.exports={authenticateToken};