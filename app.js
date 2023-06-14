require('dotenv').config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");

//APP CONFIG
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// Mongoose config
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL, (err) => {
    if (!err) {
        console.log("DB connected successfully!");
    } else {
        console.log(err);
    }
});


//MONGOOSE/MODEL CONFIG
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
const Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1457144759132-40d119c2f120?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
//     body: "HELLO THIS IS A BLOG POST!!"
// });

//RESTful Routes

app.get("/", (req,res)=>{
    res.redirect("/blogs")
});

//INDEX ROUTE
app.get("/blogs", (req, res)=>{
    Blog.find({}, (err, blogs)=>{
        if(err){
            console.log("ERROR!");
        }
        else{
            res.render("index", {blogs: blogs});
        }
    })
});

//NEW ROUTE
app.get("/blogs/new", (req, res)=>{
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", (req, res)=>{
    //console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //console.log(req.body);
    Blog.create(req.body.blog, (err, newBlog)=>{
        if(err){
            res.render("new");
        }
        else{
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", (req, res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", (req, res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", (req,res)=>{
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=>{
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/" + req.params.id);      
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id", (req, res)=>{
    Blog.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs");
        }
    });
});

app.listen(8080, ()=>{
    console.log("Server Has Started");
});