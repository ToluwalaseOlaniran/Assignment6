const Sequelize = require('sequelize');
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'QSOmYc43yMqV', {
    host: 'ep-spring-dream-a5xnrdlp.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Student = sequelize.define('Student', {
    studentNum: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

const Course = sequelize.define('Course', {
    courseId: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

Course.hasMany(Student, { foreignKey: 'course' });


module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(err => reject("unable to sync the database"));
    });
}
    

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(data => resolve(data))
            .catch(err => reject("no results returned"));
    });
}


module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
        .then(data => resolve(data))
        .catch(err => reject("no results returned"));
    });
}


module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: { studentNum: num }
        })
        .then(data => resolve(data[0]))
        .catch(err => reject("no results returned"));
    });
} 

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: { course: course }
        })
        .then(data => resolve(data))
        .catch(err => reject("no results returned"));
    });
}

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA ? true : false;
        for (let prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }
        Student.create(studentData)
            .then(() => resolve())
            .catch(err => reject("unable to create student"));
    });
}

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.findAll({
            where: { courseId: id }
        })
        .then(data => resolve(data[0]))
        .catch(err => reject("no results returned"));
    });
}

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        console.log("Updating student with data:", studentData); // Debug log

        studentData.TA = studentData.TA ? true : false;
        for (let prop in studentData) {
            if (studentData[prop] === "") {
                studentData[prop] = null;
            }
        }

        Student.update(studentData, {
            where: { studentNum: studentData.studentNum }
        })
        .then(() => {
            console.log("Student update successful"); // Debug log
            resolve();
        })
        .catch(err => {
            console.error("Update error:", err); // Debug log
            reject("unable to update student");
        });
    });
}

module.exports.addCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        // Convert empty strings to null
        for (let prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }

        // Create the course
        Course.create(courseData)
            .then(() => resolve())
            .catch(err => reject("unable to create course"));
    });
};

module.exports.updateCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        // Convert empty strings to null
        for (let prop in courseData) {
            if (courseData[prop] === "") {
                courseData[prop] = null;
            }
        }

        // Update the course
        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        })
        .then(() => resolve())
        .catch(err => reject("unable to update course"));
    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise((resolve, reject) => {
        // Destroy the course by courseId
        Course.destroy({
            where: { courseId: id }
        })
        .then(() => resolve())
        .catch(err => reject("unable to delete course"));
    });
};

module.exports.deleteStudentByNum = function(studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: { studentNum: studentNum }
        })
        .then(() => resolve())
        .catch(err => reject("unable to delete student"));
    });
};
