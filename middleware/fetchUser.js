var jwt = require("jsonwebtoken");
const JWT_SECRET = "Shamvilisagoodb$oy";

const fetchuser = (req, res, next) => {
  // Get the user from the jwt token adn add id to request object
  const token = req.header("auth-token");
  console.log("token:"+token);
  if (!token) {
    console.log("test");
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
  console.log("test2");
  try {
    console.log("test3");
    const data = jwt.verify(token, JWT_SECRET);
    console.log("test4");
    req.user = data.user;

  } catch (error) {
    console.log("test5");
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
  console.log("test6");
  next();
};

module.exports = fetchuser;
