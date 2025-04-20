// server.js// server.js
require('dotenv').config();
const express    = require('express');
const fs         = require('fs');    
const session    = require('express-session');
const mongoose   = require('mongoose');
const path       = require('path');
const authRoutes = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// 1) Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.error('❌ Erro MongoDB:', err));

// 2) Middlewares de parsing e sessão
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// 3) SERVIR A PASTA Site EM /Site
//    → assim GET /Site/gozzeio.html funciona
app.use(
  '/Site',
  express.static(path.join(__dirname, 'Site'))
);

// 4) SERVIR OUTROS ESTÁTICOS (CSS, JS, IMG)
//    No EJS/HTML use: href="/public/style.css" e src="/public/script.js"
app.use(
  '/public',
  express.static(path.join(__dirname, 'public'))
);

// 5) CONFIGURAR TEMPLATE ENGINE (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 6) ROTAS DE AUTENTICAÇÃO
app.use('/auth', authRoutes);

// 7) RAIZ REDIRECIONA PRO LOGIN
app.get('/', (req, res) => {
  return res.redirect('/auth/login');
});


// 4) Carregar chaves de API
const apiFilePath = path.join(__dirname, 'apis.json');
let apiKeys = {};
if (fs.existsSync(apiFilePath)) {
  apiKeys = JSON.parse(fs.readFileSync(apiFilePath, 'utf8'));
}

// 5) Histórico de status
let statusHistory = [];
async function checkAPIStatus() {
  try {
    await axios.get('https://likes.bielnetwork.com.br/api/v1/likes');
    statusHistory.push({ time: new Date().toISOString(), status: 'Operational' });
  } catch {
    statusHistory.push({ time: new Date().toISOString(), status: 'Down' });
  }
  if (statusHistory.length > 90) statusHistory.shift();
}
setInterval(checkAPIStatus, 5 * 60 * 1000);
checkAPIStatus();

// 6) Rotas de API originais
app.get('/api/status', (req, res) => {
  res.json({
    overallStatus: statusHistory.length ? statusHistory[statusHistory.length - 1].status : 'Unknown',
    history: statusHistory
  });
});

app.get('/apis/likes/enviar', async (req, res) => {
  const { status, uid, api_key } = req.query;
  if (!api_key || !apiKeys[api_key]) {
    return res.status(403).json({ error: 'Chave de API inválida' });
  }
  if (!status || !uid) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }
  try {
    const response = await axios.get('https://likes.bielnetwork.com.br/api/v1/likes', {
      params: { status, uid, api_key }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar requisição', details: error.message });
  }
});

app.post('/apis/addkey', (req, res) => {
  const { new_key } = req.body;
  if (!new_key || typeof new_key !== 'string' || new_key.trim().length < 5) {
    return res.status(400).json({ error: 'Chave inválida' });
  }
  apiKeys[new_key] = true;
  fs.writeFileSync(apiFilePath, JSON.stringify(apiKeys, null, 2));
  res.json({ success: 'Chave de API adicionada com sucesso' });
});

app.get('/apis/consulta/nome', async (req, res) => {
  const { query, api_key } = req.query;
  if (!query || !api_key) {
    return res.status(400).json({ error: 'Use ?query=NOME&api_key=SUA_KEY' });
  }
  if (!apiKeys[api_key]) {
    return res.status(403).json({ error: 'API Key inválida' });
  }
  try {
    const response = await axios.get(`https://api-bruxel4s.shop/nome?query=${encodeURIComponent(query)}`);
    const resultadoApi = response.data.resultado?.[0];
    if (!resultadoApi) {
      return res.json({ resultado: [{ dev: "Dogão karalho", cpf: "undefined", name: "undefined", gender: "undefined", birth: "undefined", age: 0, sign: "undefined" }] });
    }
    res.json({ resultado: [{ dev: "Dogão karalho", cpf: resultadoApi.cpf, name: resultadoApi.name, gender: resultadoApi.gender, birth: resultadoApi.birth?.trim(), age: resultadoApi.age, sign: resultadoApi.sign }] });
  } catch (err) {
    console.error('Erro na API externa:', err.message);
    res.status(500).json({ error: 'Erro ao consultar nome' });
  }
});

app.get('/apis/consulta/cpf', async (req, res) => {
  const { query, api_key } = req.query;
  if (!query || !api_key) {
    return res.status(400).json({ error: 'Use ?query=CPF&api_key=SUA_KEY' });
  }
  if (!apiKeys[api_key]) {
    return res.status(403).json({ error: 'API Key inválida' });
  }
  try {
    const response = await axios.get(`https://api-bruxel4s.shop/cpf?query=${encodeURIComponent(query)}`);
    if (!response.data || Object.keys(response.data).length === 0) {
      return res.json({ error: 'Nenhum dado encontrado para este CPF.' });
    }
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar CPF' });
  }
});

app.get('/apis/consulta/telefone', async (req, res) => {
  const { query, api_key } = req.query;
  if (!query || !api_key) {
    return res.status(400).json({ error: 'Use ?query=TELEFONE&api_key=SUA_KEY' });
  }
  if (!apiKeys[api_key]) {
    return res.status(403).json({ error: 'API Key inválida' });
  }
  try {
    const response = await axios.get(`https://api-bruxel4s.shop/telefone?query=${encodeURIComponent(query)}`);
    if (!response.data || Object.keys(response.data).length === 0) {
      return res.json({ error: 'Nenhum dado encontrado para este TELEFONE.' });
    }
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar telefone' });
  }
});

app.get('/apis/consulta/cep', async (req, res) => {
  const { query, api_key } = req.query;
  if (!query || !api_key) {
    return res.status(400).json({ error: 'Use ?query=CEP&api_key=SUA_KEY' });
  }
  if (!apiKeys[api_key]) {
    return res.status(403).json({ error: 'API Key inválida' });
  }
  try {
    const response = await axios.get(`https://api-bruxel4s.shop/cep?query=${encodeURIComponent(query)}`);
    if (!response.data || Object.keys(response.data).length === 0) {
      return res.json({ error: 'Nenhum dado encontrado para este CEP.' });
    }
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar CEP' });
  }
});

app.get('/apis/consulta/ip', async (req, res) => {
  const { query, api_key } = req.query;
  if (!query || !api_key) {
    return res.status(400).json({ error: 'Use ?query=ip&api_key=SUA_KEY' });
  }
  if (!apiKeys[api_key]) {
    return res.status(403).json({ error: 'API Key inválida' });
  }
  try {
    const response = await axios.get(`https://api-bruxel4s.shop/ip?query=${encodeURIComponent(query)}`);
    if (!response.data || Object.keys(response.data).length === 0) {
      return res.json({ error: 'Nenhum dado encontrado para este IP.' });
    }
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar IP' });
  }
});

app.get('/apis/ia/iavisionario', async (req, res) => {
  const { query, api_key } = req.query;
  if (!query || !api_key) {
    return res.status(400).json({ error: 'Use ?query=sua_mensagem&api_key=SUA_KEY' });
  }
  if (!apiKeys[api_key]) {
    return res.status(403).json({ error: 'API Key inválida' });
  }
  const respostasFixas = {
    "quem é seu dono": "Meu dono é o dogão Heheheh",
    "quem te criou": "Fui criado pelo incrível Dogão Hehehehe",
    "você é do dogão?": "Sim! Eu sou 100% do Dogão Hheheheheh",
    "visionario": "Melhor vazamentos de todos",
    "dogão": "Melhor do mundo",
    "porra": "Para de xingar"
  };
  const prompt = query.toLowerCase();
  for (const chave in respostasFixas) {
    if (prompt.includes(chave)) {
      return res.json({ resposta: respostasFixas[chave] });
    }
  }
  try {
    const geminiKey = process.env.GEMINI_KEY;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      { contents: [{ role: "user", parts: [{ text: query }] }] }
    );
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta';
    res.json({ resposta: text });
  } catch (err) {
    console.error('Erro Gemini:', err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao chamar a API Gemini' });
  }
});

// 7) Montar rotas de autenticação
app.use('/auth', authRoutes);

// 8) Redirecionar raiz para login
app.get('/', (req, res) => res.redirect('/auth/login'));

// 9) Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
