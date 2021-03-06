const BlogPosts = require("../models/BlogPosts");
const User = require("../models/User");
const Replies = require("../models/Replies");
const Liked = require("../models/Liked");
const ApprovalBlogPosts = require("../models/ApprovalBlogPosts");
var fetchuser = require("../middleware/fetchUser");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

//  body {
//     "title": "hello"
//     "description": "helo"
//     "tag": "gello"
// }

router.post("/blog", fetchuser, async (req, res) => {
  try {
    let success = false;
    const { title, description, tag, image } = req.body;
    let userid = req.user.id;

    const userdetails = await User.findById(userid).select("-password");

    const newblogpost = new BlogPosts({
      title: title,
      description: description,
      tag: tag,
      user: userid,
      username: userdetails.name,
      pfp: userdetails.pfp,
      image: image,
    });

    //

    const savedblogpost = await newblogpost.save();
    success = true;
    res.json({ success, savedblogpost });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});


router.put("/blog/:id", fetchuser, async (req, res) => {
  const { title, description, tag , image } = req.body;
  console.log(title, description, tag , image , req.params.id)
  let success = false
  try {
    //  title: title,
    
    
    let newblogpost = await BlogPosts.findById(req.params.id);
    if (!newblogpost) {
      res.status(404).send("Not Found");
    }
    
    if (newblogpost.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    
    const newpost = {
      title: title,
      description: description,
      tag: tag,
      user: req.user.id,
      image: image,
    };


    newblogpost = await BlogPosts.findByIdAndUpdate(
      req.params.id,
      {
        $set: newpost,
      },
      {
       upsert: true
      }
    );

    console.log(newblogpost)
    let success = true

    res.json({ success,  newblogpost });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/blog/:id", fetchuser, async (req, res) => {
  try {
    let blogposts = await BlogPosts.findById(req.params.id);
    if (!blogposts) {
      res.status(404).send("Not Found");
    }

    if (blogposts.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    blogposts = await BlogPosts.findByIdAndDelete(req.params.id);
    res.json({
      success: "Your Blog has successfully been deleted",
      blogposts: blogposts,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});



// router.delete("/deleteNoAuthBlog/:id", async (req, res) => {
//   try {
//     let blogposts = await BlogPosts.findById(req.params.id);
//     if (!blogposts) {
//       res.status(404).send("Not Found");
//     }

//     blogposts = await BlogPosts.findByIdAndDelete(req.params.id);
//     res.json({
//       success: "Your Blog has successfully been deleted",
//       blogposts: blogposts,
//     })
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// });

router.get("/blog/:id", async (req, res) => {
  try {
    const blogpost = await BlogPosts.find({ user: req.params.id });
    res.json(blogpost);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/fetchapprovalblog", async (req, res) => {
  try {
    const blogpost = await ApprovalBlogPosts.find({
      globalid: "blogposts",
    });
    res.json(blogpost);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/fetchuserapprovalblog", fetchuser, async (req, res) => {
  try {
    const blogpost = await ApprovalBlogPosts.find({
      user: req.user.id,
    });
    res.json(blogpost);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/fetchallblogposts", async (req, res) => {
  try {
    const blogposts = await BlogPosts.find({ globalid: "blogposts" }).limit(15);

    res.json(blogposts);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/loadmoreblogposts/:num", async (req, res) => {
  try {
    let morePosts;
    const blogposts = await BlogPosts.find({ globalid: "blogposts" }).limit(
      req.params.num + 10
    );
    console.log(blogposts.length , req.params.num )

    if(blogposts.length == req.params.num) {
      morePosts = false
    } else {
      morePosts = true
    }

    console.log(morePosts)
 
    
    // console.log(blogposts)

    res.json({blogposts , morePosts});
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/fetchblog/:id", async (req, res) => {
  try {
    let blogposts = await BlogPosts.findById(req.params.id);

    res.json(blogposts);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// id 62010004490dfdd34e6064e6

router.post("/reply/", fetchuser, async (req, res) => {
  try {
    const { reply, postid } = req.body;
    let userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    const replies = new Replies({
      pfp: user.pfp,
      postid: postid,
      reply: reply,
      user: userId,
      name: user.name,
    });

    const savedreplies = await replies.save();
    res.json({ savedreplies });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/fetchreplies/:id", async (req, res) => {
  console.log("req" + req);
  try {
    const replies = await Replies.find({ postid: req.params.id });

    res.json(replies);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/likepost/:id", fetchuser, async (req, res) => {
  try {
    const { posttype } = req.body;

    let userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    const userupdate = await User.findByIdAndUpdate(
      userId,
      {
        $set: { likes: user.likes + 1 },
      },
      {
        new: true,
      }
    ).select("-password");

    const newLiked = new Liked({
      commentid: req.params.id,
      likedby: userId,
      pfp: user.pfp,
    });

    const savedLiked = await newLiked.save();

    let likedamount = await Liked.find({ commentid: req.params.id });

    let newblogpost = await BlogPosts.findById(req.params.id);
    let newlikes = {
      likes: likedamount,
    };

    newblogpost = await BlogPosts.findByIdAndUpdate(
      req.params.id,
      {
        $set: { likes: likedamount },
      },
      {
        new: true,
      }
    );

    res.json({ status: "done" });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/unlikepost/:id", fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
    let liked = await Liked.findOneAndDelete({
      commentid: req.params.id,
      likedby: userId,
    });

    const user = await User.findById(userId).select("-password");

    const userupdate = await User.findByIdAndUpdate(
      userId,
      {
        $set: { likes: user.likes - 1 },
      },
      {
        new: true,
      }
    ).select("-password");

    let likedamount = await Liked.find({ commentid: req.params.id });

    let newblogpost = await BlogPosts.findById(req.params.id);
    let newlikes = {
      likes: likedamount,
    };

    newblogpost = await BlogPosts.findByIdAndUpdate(
      req.params.id,
      {
        $set: newlikes,
      },
      {
        new: true,
      }
    );
    res.json({ status: "done" });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/fetchliked/:id", fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
    let liked = await Liked.findOne({
      commentid: req.params.id,
      likedby: userId,
    });
    if (liked) {
      res.json({ liked: true });
    } else {
      res.json({ liked: false });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

// router.post("/post", fetchuser, async (req, res) => {
//   try {
//     let success = false;
//     const { title, description, tag } = req.body;
//     let userid = req.user.id;

//

//     const userdetails = await User.findById(userid).select("-password");

//     const newblogpost = new BlogPosts({
//       title: title,
//       description: description,
//       tag: tag,
//       user: userid,
//       username: userdetails.name,
//     });

//     //

//     const savedblogpost = await newblogpost.save();
//     success = true;
//     res.json({ success, savedblogpost });
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// });
