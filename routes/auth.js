const express = require("express");
const User = require("../models/User");
const Replies = require("../models/Replies");
const router = express.Router();
const { body, validationResult } = require("express-validator");
// const bcrypt = require("bcrypt");
const md5 = require("md5");
var jwt = require("jsonwebtoken");
fetchuser = require("../middleware/fetchUser");

const JWT_SECRET = "Shamvilisagoodb$oy";

//ROUTE 1:Create a User using: POST "/api/auth/createuser". Doesnt require Auth
router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Enter a valid name").isLength({ min: 5 }),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;

    // if there are errors , return Bad requests and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      // check whether the userwith the same email exits already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, errors: "Sorry a user with email already exists" });
      }
      // const salt = await bcrypt.genSalt(10);
      // secPass = await bcrypt.hash(req.body.password, salt);

      const secPass = md5(req.body.password);
      console.log("secPass"+ secPass);

      // Create a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      console.log(authToken);

      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured");
    }
  }
);

// ROUTE 2: Authenticate a user using: POST "/api/auth/createuser". NO login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    try {
    let success = true;
    // if there are errors , return Bad requests and the errors
    const errors = validationResult(req);
      try {
        if (!errors.isEmpty()) {
          success = false;
          return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email, password } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
          success = false;
          return res
            .status(400)
            .json({ success, error: "Please use correct credentials" });
        }

        // const passwordCompare = await bcrypt.compare(password, user.password);
        const passwordCompare = md5(password) == user.password ? true : false;
        console.log("passwordCompare: " + passwordCompare);

        if (!passwordCompare) {
          success = false;
          return res
            .status(400)
            .json({ success, error: "Please use correct credentials" });
        }

        const data = {
          user: {
            id: user.id,
          },
        };

        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ success, authToken });
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");  // removing this also results in same error
      
      }
    } catch (error) {
      console.error(error);
     
    }
  }
);

// ROUTE #: GET logged in user details: POST "/api/auth/getuser". login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send({ user, userId });
  } catch (error) {
    console.error(error.message);
    // res.status(500).send("Internal Server Error");
  }
});

router.put("/edituser", fetchuser, async (req, res) => {
  console.log("här");
  try {
    const { pfp, bio } = req.body;

    let userId = req.user.id;
    let user = await User.findById(userId).select("-password");

    let reply = await Replies.findByIdAndUpdate(
      userId,
      {
        $set: { pfp: pfp },
      },
      {
        new: true,
      }
    );

    let newProfile = {
      pfp: pfp,
      bio: bio,
    };

    user = await User.findByIdAndUpdate(
      userId,
      {
        $set: newProfile,
      },
      {
        new: true,
      }
    );

    res.send({ user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getUserId", fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
    res.json(userId);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/fetchallusers/", async (req, res) => {
  console.log("inside fetchallusers/");
  try {
    console.log("fetchallusers innan user: ");
    const user = await User.find()
      .select("-password")
      .select("-email")
      .limit(10);

    console.log("fetchallusers: user: " + user);
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
  console.log("after fetchallusers/");
});

router.get("/test/", async (req, res) => {
  console.log("inside test/");
  res.send("det funkar inte");
});

router.get("/injection-endpoint/", async (req,res) => {
  const url = "https://data.mongodb-api.com/app/data-snmjq/endpoint/data/beta";
  const apiKey = "u4FaeLXsYiaRwe5OE3WggNlSBH8sf8y2lwFbxp1jWo24BjsTV2L0ZYukkUHx5mJX";
})


module.exports = router;
