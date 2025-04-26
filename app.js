const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express(); //
// Uwu uWu uWu
app.use(express.urlencoded({ extended: true })); 
// Uwu uWu uWu
app.use(express.static(path.join(__dirname, 'public')));

// Uwu uWu uWu
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'segredo_super_secreto',
  resave: false,
  saveUninitialized: false,
}));

// Uwu uWu uWu
mongoose.connect('mongodb+srv://thhhmetods:7MRJ3b9aK4Ac29S9@authvisionarioooo.0zffxmn.mongodb.net/?retryWrites=true&w=majority&appName=authvisionarioooo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Uwu uWu uWu
app.use('/auth', authRoutes);

// Uwu uWu uWu
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});
// Uwu uWu uWu
app.listen(3000, () => {
  console.log('- Uwu Uwu uWu  http://localhost:3000');
});
