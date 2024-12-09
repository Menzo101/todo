const express = require('express');
const app = express();
const exphbs = require("express-handlebars")
const mongoose = require("mongoose");
require("dotenv").config();
const todomodel = require("./models/todo")

// Connect to MongoDB
const url = process.env.MONGO_URL
mongoose.connect(url)
.then(() => console.log("MongoDB Connected..."))
.catch(() =>{
    console.log("Connection Failed...");
    // process.exit(1);
})


// setup engine
app.engine("hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    runtimeOptions:{
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true
    }
}))

// set view engine
app.set("view engine", "hbs")


// Middleware
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

function formatDate(date){
    let days;
    const currentdate = new Date(date)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const day = currentdate.getDate();
    if(day === 1 || day === 21 || day === 31){
        days = day + "st";
    }else if(day === 2 || day === 22){
        days = day + "nd";
    }else if(day === 3 || day === 23){
        days = day + "rd";
    }else{
        days = day + "th";
    }
    const month = months[date.getMonth()]
    const year = currentdate.getFullYear();

    return `${days} ${month} ${year}`;
}

function format(date){
    const currentdate = new Date(date);
    const options = {day: "numeric", month: "short", year: "numeric"}
    return new Intl.DateTimeFormat("en-GB", options).format(currentdate)
}

// ccreating our routes
app.get("/", async(req, res)=>{
    const alltask = await todomodel.find();
    // console.log(tasks)
    const tasks = alltask.map((item)=>{
        const newdate = format(item.date)
        return {...item.toObject(), date: newdate}
    })

    // console.log(alltask)
    // console.log(tasks)
    res.render("todo", {tasks})
})

app.post("/", async(req, res)=>{
    const {task} = req.body;
    if(!task || task.trim() === ""){
        return res.render("todo", {error: "Task can not be blank"})
    }

    await todomodel.create({
        todo: task,
        // date: Date.now(),
        // completed: false
    });
    const alltask = await todomodel.find();
    const tasks = alltask.map((item)=>{
        const newdate = format(item.date)
        return {...item.toObject(), date: newdate}
    })
    res.render("todo", {message: "Todo added successfully" , tasks})
});
   app.get("/completed/:id", async(req,res)=>{
     const newId = req.params.id;
     await todomodel.findByIdAndUpdate(newId,{completed:true})
      res.redirect('/')
   });
app.post("/update/:id", async(req,res)=>{
    const newId = req.params.id;
    const newtask= req.body.newtask
     await todomodel.findByIdAndUpdate(newId, {todo:newtask})
     res.redirect('/')
})
app.get("/delete/:id",async (req,res)=>{
    const newId = req.params.id;
    await todomodel.findByIdAndDelete(newId);
    res.redirect("/?message=tasks has beeen deleted successfully")
})
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})