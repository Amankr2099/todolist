const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(express.static("stylings"))


mongoose.connect("mongodb://localhost:27017/todolistDB")
const itemSchema = {
    name: String
}
const Item = mongoose.model("Item", itemSchema)
const defaultInstruction = [
    {
        name: "Welcome to your personal toDoList"
    },
    {
        name: "Add your task by + button"
    },
    {
        name: "Save your tasks"
    }
]

const categorySchema = {
    name : String,
    listOfTask : [itemSchema]
}
const Category = mongoose.model("Category",categorySchema)

// var taskLists = []
// var task
const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};


var today = new Date()

app.get("/", function (req, res) {
    // res.sendFile(__dirname + "/home.html")
    // res.render("updated-home",{
    //     newTasks: taskLists,
    //     todayDate : today.toLocaleDateString("en-US",options)
    // })
    Item.find({})
        .then((items) => {
            if (items.length === 0) {
                Item.insertMany(defaultInstruction)
                .then(console.log("Default task added"))
                .catch((err) => { console.log(err); })
                res.redirect("/")
            } else {
                res.render("updated-home", {
                    newTasks: items,
                    // postLink : null,
                    listTitle: today.toLocaleDateString("en-US", options)
                })
            }
        })
        .catch((err) => { console.log(err); })

})

app.post("/", function (req, res) {
    const task = req.body.inputTask
    const listCategory = req.body.listType
    const item = new Item({
        name : task
    })
    // item.save()
    //     res.redirect("/")
    // if (listCategory === "Home") {
    //     item.save()
    //     res.redirect("/")
    // }else{
    //     Category.findOne({name:listCategory})
    //     .then((category)=>{
    //         category.listOfTask.push(item)
    //     })
    //     .catch((err) => { console.log(err); })
    //     res.redirect("/"+ listCategory)
    // }
    Category.findOne({name:listCategory})
    .then((category)=>{
        if (!category) {
            item.save()
            res.redirect("/")
        } else {
            category.listOfTask.push(item)
            category.save()
            res.redirect("/"+ listCategory)
        }
    })
    .catch((err) => { console.log(err); })
    
    console.log("New task added");
    // taskLists.push(task)
    // res.redirect("/")

})

app.post("/delete",function (req,res) {
    const deletedItem = req.body.crossedItem;
    Item.findByIdAndRemove({_id:deletedItem})
    .then(console.log("One Item Deleted"))
    res.redirect("/")
})

app.get("/:path",function (req,res) {
    const pathName = req.params.path

    Category.findOne({name:pathName})
    .then((category)=>{ 
        if (!category) {
            const category = new Category({
                name : pathName,
                listOfTask : defaultInstruction
            })
            category.save()
            console.log("Created new category")
            res.redirect("/"+ pathName)
        }else{
            res.render("updated-home",{
                newTasks: category.listOfTask,
                listTitle: category.name
            })
        }
    })
    .catch((err) => { console.log(err); })
})

app.listen(3000, function () {
    console.log("Server Initiated");
})
