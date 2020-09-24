var express 			= require("express"),
	app     			= express(),
	methodOverride  	= require("method-override"),
	bodyParser 			= require("body-parser"),
	expressSanitizer	= require("express-sanitizer"),
	mongoose    		= require("mongoose");

mongoose.connect("mongodb://localhost/restful_blog_app",{
	useNewUrlParser : true,
	useUnifiedTopology: true
})
.then(()=> console.log("Connected to DB.."))
.catch(error => console.log(error.message));

//APP CONFIG
app.set("view engine","ejs");	
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


//MONGOOSE/MODEL CONFIG 
var blogSchema = new mongoose.Schema({
	title : String,
	image : String,
	body : String,
	created : { type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);


//RESTFUL ROUTES 


//INDEX ROUTE
app.get("/",function(req,res){
	res.redirect("/blogs");
});

app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		err ? console.log(err) : res.render("index",{blogs:blogs});
	});
});


//NEW ROUTE
app.get("/blogs/new",function(req,res){
	res.render("new");
});

//CREATE ROUTE
app.post("/blogs",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//create blog
	Blog.create(req.body.blog,function(err,blog){ // in new.ejs we named all inputs with blog["something"] and we can pass data threw an array "blog"
		err ? console.log(err.message) : res.redirect("/blogs");
	});
	//redirect
});

//SHOW ROUTE
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,blog){
		err ? res.redirect("/blogs") : res.render("show",{blog:blog});
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,blog){
		err ? res.redirect("/blogs") : res.render("edit",{blog:blog});
	});
});

//UPDATE ROUTE
app.put("/blogs/:id",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,blog){
		err ? res.redirect("/blogs") : res.redirect("/blogs/"+req.params.id);
	}); 
})

//DELETE ROUTE
app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		res.redirect("/blogs");
	});
});



app.listen(3000,function(){
	console.log("Server has started..");
});
	