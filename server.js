/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy:
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*  Name: ______________________ Student ID: ______________ Date: ______________
*  Published URL: ___________________________________________________________
********************************************************************************/

// Required modules and setup
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
var collegeData = require("./modules/collegeData");
var exphbs = require("express-handlebars");

// Set up express-handlebars
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set("view engine", ".hbs");

// Middleware setup
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));

// Middleware to set activeRoute
app.use(function(req, res, next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});

// Routes for Students
app.get("/students", async (req, res) => {
    try {
        let data = [];
        if (req.query.course) {
            data = await collegeData.getStudentsByCourse(req.query.course) || [];
        } else {
            data = await collegeData.getAllStudents() || [];
        }
        
        if (data.length > 0) {
            res.render("students", {students: data});
        } else {
            res.render("students", {message: "no results"});
        }
    } catch (err) {
        res.render("students", {message: "no results"});
    }
});

app.get("/students/add", async (req, res) => {
    try {
        const courses = await collegeData.getCourses();
        res.render("addStudent", { courses: courses });
    } catch (err) {
        res.render("addStudent", { courses: [] });
    }
});


app.post("/students/add", async (req, res) => {
    try {
        await collegeData.addStudent(req.body);
        res.redirect("/students");
    } catch (err) {
        res.status(500).send("Unable to add student");
    }
});

app.post("/student/update", async (req, res) => {
    try {
        await collegeData.updateStudent(req.body);
        res.redirect("/students");
    } catch (err) {
        res.status(500).send("Unable to update student");
    }
});

app.get("/student/:studentNum", (req, res) => { 
    // Initialize an empty object to store the values     
    let viewData = {}; 

    collegeData.getStudentByNum(req.params.studentNum)
        .then((data) => {         
            if (data) { 
                viewData.student = data; // Store student data in the "viewData" object as "student" 
            } else { 
                viewData.student = null; // Set student to null if none were returned 
            } 
        })
        .catch((err) => { 
            viewData.student = null; // Set student to null if there was an error  
        })
        .then(() => {
            return collegeData.getCourses(); // Ensure this returns a promise
        })
        .then((data) => { 
            viewData.courses = data; // Store course data in the "viewData" object as "courses" 

            // Loop through viewData.courses and once we have found the courseId that matches 
            // the student's "course" value, add a "selected" property to the matching 
            // viewData.courses object 
            for (let i = 0; i < viewData.courses.length; i++) { 
                if (viewData.courses[i].courseId == viewData.student.course) {                 
                    viewData.courses[i].selected = true; 
                } 
            } 
        })
        .catch((err) => { 
            viewData.courses = []; // Set courses to empty if there was an error 
        })
        .then(() => { 
            if (viewData.student == null) { // If no student - return an error             
                res.status(404).send("Student Not Found"); 
            } else { 
                res.render("student", { viewData: viewData }); // Render the "student" view 
            } 
        }); 
}); 


app.get("/student/delete/:studentNum", async (req, res) => {
    try {
        await collegeData.deleteStudentByNum(req.params.studentNum);
        res.redirect("/students");
    } catch (err) {
        res.status(500).send("Unable to Remove Student / Student not found");
    }
});

// Routes for Courses
app.get("/courses", async (req, res) => {
    try {
        const data = await collegeData.getCourses() || [];
        
        if (data.length > 0) {
            res.render("courses", {courses: data});
        } else {
            res.render("courses", {message: "no results"});
        }
    } catch (err) {
        res.render("courses", {message: "no results"});
    }
});

app.get("/courses/add", (req, res) => {
    res.render("addCourse");
});

app.post("/courses/add", async (req, res) => {
    try {
        await collegeData.addCourse(req.body);
        res.redirect("/courses");
    } catch (err) {
        res.status(500).send("Unable to add course");
    }
});

app.post("/course/update", async (req, res) => {
    try {
        await collegeData.updateCourse(req.body);
        res.redirect("/courses");
    } catch (err) {
        res.status(500).send("Unable to update course");
    }
});

app.get("/course/:id", async (req, res) => {
    try {
        const data = await collegeData.getCourseById(req.params.id) || null;
        if (data) {
            res.render("course", { course: data });
        } else {
            res.status(404).send("Course Not Found");
        }
    } catch (err) {
        res.status(500).send("Course Not Found");
    }
});

app.get("/course/delete/:id", async (req, res) => {
    try {
        await collegeData.deleteCourseById(req.params.id);
        res.redirect("/courses");
    } catch (err) {
        res.status(500).send("Unable to Remove Course / Course not found");
    }
});

// Static routes for home, about, and HTML demo
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/htmlDemo", (req, res) => {
    res.render("htmlDemo");
});

// 404 Error handler
app.use((req, res) => {
    res.status(404).send("Oops, looks like you are lost.");
});

// Start the server
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("server listening on port: " + HTTP_PORT);
    });
}).catch((err) => {
    console.error("Unable to start server: " + err);
});
