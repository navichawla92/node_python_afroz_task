
verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }
  if(token != process.env.API_TOKEN){
     return res.status(401).send({
        message: "Unauthorized!"
      });
  }
  else{
    next();
  }
};

const authJwt = {
  verifyToken: verifyToken
};
module.exports = authJwt;
