// jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const serverless = require("serverless-http");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam...";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque...";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien...";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://omjain4:omjain4@cluster0.4zclh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useUnifiedTopology: true, useNewUrlParser: true });

// Post Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "No title specified."]
  },
  content: {
    type: String,
    required: [true, "No content specified."]
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
  res.render("compose");
});

app.post("/compose", async function(req, res) {
   try {
     const post = new Post({
       title: req.body.postTitle,
       content: req.body.postBody
     });
 
     await post.save(); // Using async/await instead of callback
     res.redirect("/");
   } catch (err) {
     console.error(err);
     res.status(500).send("Error saving post.");
   }
});

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

// Serverless function setup for Vercel
module.exports.handler = serverless(app);
