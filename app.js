// jshint esversion: 6
const serverless = require('serverless-http');

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam...";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque...";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien...";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// In app.js
mongoose.connect("mongodb+srv://omjain4:omjain4@cluster0.4zclh.mongodb.net/blogDB?retryWrites=true&w=majority")
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Connection error:", err));

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    minlength: [3, "Title must be at least 3 characters"],
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  content: {
    type: String,
    required: [true, "Content is required"],
    minlength: [10, "Content must be at least 10 characters"],
    maxlength: [5000, "Content cannot exceed 5000 characters"]
  }
});

const Post = mongoose.model("Post", postSchema);

app.get("/", async function(req, res) {
   try {
     const foundPosts = await Post.find({});
     res.render("home", {
       startingContent: homeStartingContent,
       posts: foundPosts
     });
   } catch (err) {
     console.error(err);
     res.status(500).send("Error retrieving posts.");
   }
});

app.get("/about", function(req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function(req, res) {
  res.render("contact", { contactContent: contactContent });
});

app.get("/compose", function(req, res) {
  res.render("compose", {
    error: false,
    titleError: '',
    contentError: '',
    postTitle: '',
    postBody: ''
  });
});

app.post("/compose", async function(req, res) {
  try {
    const post = new Post({
      title: req.body.postTitle.trim(),
      content: req.body.postBody.trim()
    });

    await post.validate(); // Manually trigger validation
    
    await post.save();
    res.redirect("/");
  } catch (err) {
    const errors = {};
    
    // Handle validation errors
    if (err.errors) {
      for (const field in err.errors) {
        errors[`${field}Error`] = err.errors[field].message;
      }
    }

    res.render("compose", {
      error: err.message,
      ...errors,
      postTitle: req.body.postTitle,
      postBody: req.body.postBody
    });
  }
})

// POSTS Route - GET
app.get("/posts/:postID", async function(req, res) {
   const reqPostID = req.params.postID;
   try {
     const post = await Post.findOne({ _id: reqPostID });
     if (post) {
       res.render("post", { post: post });
     } else {
       res.status(404).send("Post not found.");
     }
   } catch (err) {
     console.error(err);
     res.status(500).send("Error retrieving the post.");
   }
});
const port =  process.env.PORT || 9001;
app.listen(port,(req,res)=>{
  console.log("Server is running on port ${port}");
});
module.exports.handler = serverless(app);