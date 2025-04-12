const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// Carregar chaves de API do arquivo apis.json
let apiKeys = {};
const apiFilePath = path.join(__dirname, 'apis.json');

if (fs.existsSync(apiFilePath)) {
    apiKeys = JSON.parse(fs.readFileSync(apiFilePath, 'utf8'));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let statusHistory = [];

// Função para checar o status da API principal periodicamente
async function checkAPIStatus() {
    try {
        await axios.get('https://likes.bielnetwork.com.br/api/v1/likes');
        statusHistory.push({ time: new Date().toISOString(), status: 'Operational' });
    } catch (error) {
        statusHistory.push({ time: new Date().toISOString(), status: 'Down' });
    }

    if (statusHistory.length > 90) statusHistory.shift(); // Mantém histórico dos últimos 90 checks
}

// Executar o check de status a cada 5 minutos
setInterval(checkAPIStatus, 5 * 60 * 1000);
checkAPIStatus(); // Primeiro check imediato

// Rota para obter o status da API
app.get('/api/status', (req, res) => {
    res.json({
        overallStatus: statusHistory.length ? statusHistory[statusHistory.length - 1].status : 'Unknown',
        history: statusHistory
    });
});

// Rota para enviar likes
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
        res.status(500).json({ error: 'Erro ao processar a requisição', details: error.message });
    }
});

// Rota para adicionar chave de API
app.post('/apis/addkey', (req, res) => {
    const { new_key } = req.body;

    if (!new_key || typeof new_key !== 'string' || new_key.trim().length < 5) {
        return res.status(400).json({ error: 'Chave inválida' });
    }

    apiKeys[new_key] = true;
    fs.writeFileSync(apiFilePath, JSON.stringify(apiKeys, null, 2));

    res.json({ success: 'Chave de API adicionada com sucesso' });
});

// ✅ Rota para consulta de nome (corrigida)
app.get('/apis/consulta/nome', async (req, res) => {
    const { query, api_key } = req.query;

    if (!query || !api_key) {
        return res.status(400).json({ error: 'Parâmetros inválidos. Use ?query=NOME&api_key=SUA_KEY' });
    }

    if (!apiKeys[api_key]) {
        return res.status(403).json({ error: 'API Key inválida' });
    }

    try {
        const response = await axios.get(`https://api-bruxel4s.shop/nome?query=${encodeURIComponent(query)}`);
        const resultadoApi = response.data.resultado?.[0];

        if (!resultadoApi) {
            return res.json({
                resultado: [{
                    dev: "Dogão karalho",
                    cpf: "undefined",
                    name: "undefined",
                    gender: "undefined",
                    birth: "undefined",
                    age: 0,
                    sign: "undefined"
                }]
            });
        }

        const resultado = {
            dev: "Dogão karalho",
            cpf: resultadoApi.cpf || "undefined",
            name: resultadoApi.name || "undefined",
            gender: resultadoApi.gender || "undefined",
            birth: resultadoApi.birth?.trim() || "undefined",
            age: resultadoApi.age || 0,
            sign: resultadoApi.sign || "undefined"
        };

        res.json({ resultado: [resultado] });

    } catch (err) {
        console.error('Erro na API externa:', err.message);
        res.status(500).json({ error: 'Erro ao consultar nome na API externa.' });
    }
});

app.get('/apis/consulta/cpf', async (req, res) => {
    const { query, api_key } = req.query;

    if (!query || !api_key) {
        return res.status(400).json({ error: 'Parâmetros inválidos. Use ?query=CPF&api_key=SUA_KEY' });
    }

    if (!apiKeys[api_key]) {
        return res.status(403).json({ error: 'API Key inválida' });
    }

    try {
        const response = await axios.get(`https://api-bruxel4s.shop/cpf?query=${encodeURIComponent(query)}`);
        const resultadoApi = response.data;

        if (!resultadoApi || Object.keys(resultadoApi).length === 0) {
            return res.json({ error: 'Nenhum dado encontrado para este CPF.' });
        }

        return res.json(resultadoApi); // ✅ Retorna tudo conforme a API original
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao consultar o CPF.' });
    }
});

app.get('/apis/consulta/telefone', async (req, res) => {
    const { query, api_key } = req.query;

    if (!query || !api_key) {
        return res.status(400).json({ error: 'Parâmetros inválidos. Use ?query=TELEFONE&api_key=SUA_KEY' });
    }

    if (!apiKeys[api_key]) {
        return res.status(403).json({ error: 'Api key invalida seu burro' });
    }

    try {
        const response = await axios.get(`https://api-bruxel4s.shop/telefone?query=${encodeURIComponent(query)}`);
        const resultadoApi = response.data;

        if (!resultadoApi || Object.keys(resultadoApi).length === 0) {
            return res.json({ error: 'Nenhum dado encontrado para este TELEFONE.' });
        }

        return res.json(resultadoApi); // ✅ Retorna tudo conforme a API original
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao consultar o TELEFONE.' });
    }
});

app.get('/apis/consulta/cep', async (req, res) => {
    const { query, api_key } = req.query;

    if (!query || !api_key) {
        return res.status(400).json({ error: 'Parâmetros inválidos. Use ?query=CEP&api_key=SUA_KEY' });
    }

    if (!apiKeys[api_key]) {
        return res.status(403).json({ error: 'Api key invalida seu burro' });
    }

    try {
        const response = await axios.get(`https://api-bruxel4s.shop/cep?query=${encodeURIComponent(query)}`);
        const resultadoApi = response.data;

        if (!resultadoApi || Object.keys(resultadoApi).length === 0) {
            return res.json({ error: 'Nenhum dado encontrado para este CEP.' });
        }

        return res.json(resultadoApi); // ✅ Retorna tudo conforme a API original
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao consultar o CEP.' });
    }
});


app.get('/apis/consulta/ip', async (req, res) => {
    const { query, api_key } = req.query;

    if (!query || !api_key) {
        return res.status(400).json({ error: 'Parâmetros inválidos. Use ?query=ip&api_key=SUA_KEY' });
    }

    if (!apiKeys[api_key]) {
        return res.status(403).json({ error: 'Api key invalida seu burro' });
    }

    try {
        const response = await axios.get(`https://api-bruxel4s.shop/ip?query=${encodeURIComponent(query)}`);
        const resultadoApi = response.data;

        if (!resultadoApi || Object.keys(resultadoApi).length === 0) {
            return res.json({ error: 'Nenhum dado encontrado para este IP.' });
        }

        return res.json(resultadoApi); // ✅ Retorna tudo conforme a API original
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao consultar o IP.' });
    }

});
app.get('/apis/ia/iavisionario', async (req, res) => {
    const { query, api_key } = req.query;
  
    if (!query || !api_key) {
      return res.status(400).json({
        error: 'Parâmetros faltando. Use ?query=sua_mensagem&api_key=sua_key'
      });
    }
  
    // Carrega e valida o api_key com apis.json
    let validKeys;
    try {
      validKeys = JSON.parse(fs.readFileSync('./apis.json', 'utf-8'));
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao ler o arquivo apis.json' });
    }
  
    if (!validKeys[api_key]) {
      return res.status(403).json({ error: 'API Key inválida ou não autorizada.' });
    }
  
    const prompt = query.toLowerCase();
  
    // Lista de respostas personalizadas
    const respostasFixas = {
      "quem é seu dono": "Meu dono é o dogão Heheheh",
      "quem te criou": "Fui criado pelo incrível Dogão Hehehehe",
      "você é do dogão?": "Sim! Eu sou 100% do Dogão Hheheheheh",
      "visionario": "Melhor vazamentos de todos",
      "dogão": "Melhor do mundo",
      "Porra": "Para de xingar",
    };
  
    for (const chave in respostasFixas) {
      if (prompt.includes(chave)) {
        return res.json({ resposta: respostasFixas[chave] });
      }
    }
  
    // Chave da Gemini REAL
    const geminiKey = 'AIzaSyDjricQuCR5Grp8O-joxTukuXnRSngavyQ';
  
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: query }]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
  
      const respostaGemini = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta';
  
      res.json({
        resposta: respostaGemini
      });
  
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao chamar a API Gemini',
        detalhes: error.response?.data || error.message
      });
    }
  });


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
