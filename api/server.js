import {translate} from "./services/translator.js"
import express from 'express';

const app = express();

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Porta onde o servidor será executado
const PORT = process.env.PORT || 3000;

app.get('/translate/:message', async (req, res) => {
    try {
        const params = req.params;
        const { to, from } = req.query;
        const result = await translate(params.message,to,from);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ------------------- INICIAR SERVIDOR -------------------
app.listen(PORT, () => {
    app.use(express.static('../ui'));
    console.log(`Servidor rodando na porta ${PORT}`);
});
