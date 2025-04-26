const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('login');
});

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('register');
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.send('Usuário já existe');

    const hash = await bcrypt.hash(password, 10);
    await new User({ username, password: hash }).save();
    return res.redirect('/auth/login');
  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).send('Erro interno ao registrar');
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.send('Usuário não encontrado');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send('Senha incorreta');

    // Login bem-sucedido
    req.session.user = user.username;
    return res.redirect('/Site/gozzeii.html');
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).send('Erro interno ao fazer login');
  }
});

module.exports = router;
