const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");


const csurf = require('csurf');
const cookieParser = require('cookie-parser');

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 100 // max 100req per 3 minutes or 0.5 req per second
});


dotenv.config();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

global.db = db;

app.use(cookieParser());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"], 
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.set('port', process.env.PORT);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public/"));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));

app.use(limiter);

const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);



app.get('/', (req, res) => {
  let query = "SELECT * FROM `projects` ORDER BY pid DESC"; // query database to get all the projects
  // execute query
  db.query(query, (err, result) => {
    if (err) {
      res.redirect('/');
    }
    res.render('index.ejs', {
      title: 'Welcome | View Projects',
      projects: result,
      username: req.session.username, // pass username to the view
      csrfToken: req.csrfToken() // pass CSRF token to the view
    });
  });
});

app.get('/project/:id', (req, res) => {
  let query = "SELECT projects.*, users.username FROM `projects` INNER JOIN `users` ON projects.uid = users.uid WHERE projects.pid = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) throw err;
    // format the dates
    let startDate = new Date(result[0].start_date);
    let endDate = new Date(result[0].end_date);
    let formattedStartDate = startDate.toDateString();
    let formattedEndDate = endDate.toDateString();
    result[0].start_date = formattedStartDate;
    result[0].end_date = formattedEndDate;
    res.render('project-details.ejs', {
      title: 'Project Details',
      project: result[0],
      username: req.session.username,
      uid: req.session.uid
    });
  });
});


app.get('/register', (req, res) => {
  res.render('register.ejs', {
    title: 'Register',
    csrfToken: req.csrfToken() // pass CSRF token to the view
  });
});

app.post('/register', csrfProtection, (req, res) => {
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    if (err) {
      res.redirect('/register');
    } else {
      let query = "INSERT INTO `users` (username, password, email) VALUES (?, ?, ?)";
      db.query(query, [req.body.username, hash, req.body.email], (err, result) => {
        if (err) {
          res.redirect('/register');
        }
        res.redirect('/');
            // TODO AUTO LOGIN AFTER REGISTER 
      });
    }
  });
});

app.post('/login', csrfProtection, (req, res) => {
  let query = "SELECT * FROM `users` WHERE username = ?";
  db.query(query, [req.body.username], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, function(err, isMatch) {
        if (err) {
          res.send('An error occurred.');
        } else if (!isMatch) {
          res.send('Incorrect Username and/or Password!');
        } else {
          req.session.loggedin = true;
          req.session.username = req.body.username;
          req.session.uid = result[0].uid; // Store uid in session
          res.redirect('/');
        }
      });
    } else {
      res.send('Incorrect Username and/or Password!');
    }
  });
});

app.get('/add-project', (req, res) => {
  if (req.session.loggedin) {
    res.render('add-project.ejs', { 
      title: 'Add Project', 
      username: req.session.username, 
      uid: req.session.uid,
      csrfToken: req.csrfToken() 
    });
  } else {
    res.render('message.ejs', { title: 'Access Denied', message: 'Please login to view this page!' });
  }
});

app.post('/add-project', csrfProtection, (req, res) => {
  let query = "INSERT INTO `projects` (title, start_date, end_date, phase, description, uid) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(query, [req.body.title, req.body.start_date, req.body.end_date, req.body.phase, req.body.description, req.body.uid], (err, result) => {
    if (err) throw err;
    res.redirect('/');
});
});

app.get('/update-project/:id', (req, res) => {
  if (req.session.loggedin) {
    let query = "SELECT * FROM `projects` WHERE pid = ? AND uid = ?";
    db.query(query, [req.params.id, req.session.uid], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        // format the dates
        let startDate = new Date(result[0].start_date);
        let endDate = new Date(result[0].end_date);
        let formattedStartDate = startDate.getFullYear() + '-' + (startDate.getMonth() + 1).toString().padStart(2, '0') + '-' + startDate.getDate().toString().padStart(2, '0');
        let formattedEndDate = endDate.getFullYear() + '-' + (endDate.getMonth() + 1).toString().padStart(2, '0') + '-' + endDate.getDate().toString().padStart(2, '0');
        result[0].start_date = formattedStartDate;
        result[0].end_date = formattedEndDate;
        res.render('update-project.ejs', {
          title: 'Update Project',
          project: result[0],
          username: req.session.username,
          uid: req.session.uid,
          csrfToken: req.csrfToken()
        });
      } else {
        res.render('message.ejs', { title: 'Access Denied', message: 'You do not have permission to update this project.' });
      }
    });
  } else {
    res.render('message.ejs', { title: 'Access Denied', message: 'Please login to view this page!' });
  }
});

app.post('/update-project/:id', csrfProtection, (req, res) => {
  let query = "SELECT * FROM `projects` WHERE pid = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      if (result[0].uid !== req.session.uid) {
        res.render('message.ejs', { title: 'Access Denied', message: 'You do not have permission to update this project.' });
      } else {
        let query = "UPDATE `projects` SET title = ?, start_date = ?, end_date = ?, phase = ?, description = ? WHERE pid = ? AND uid = ?";
        db.query(query, [req.body.title, req.body.start_date, req.body.end_date, req.body.phase, req.body.description, req.params.id, req.body.uid], (err, result) => {
          if (err) throw err;
          res.redirect('/');
        });
      }
    } else {
      res.render('message.ejs', { title: 'Access Denied', message: 'This project does not exist.' });
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start the server
app.listen(app.get('port'), () => {
  console.log(`Server running at http://localhost:${app.get('port')}`);
});

module.exports = app; // handle to vercel if applicable
