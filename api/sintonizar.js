// api/sintonizar.js
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  
  // 1. CORS (Hoppscotch friendly)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 2. Escudo de métodos
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: "Diga 'Não' para métodos incorretos." });
  }

  // 🔧 AJUSTE 1: Extrai os campos com fallback seguro
  const { nome, filosofia, intencao } = req.body || {};

  // Escudo na porta da rede
  if (!nome || !filosofia || !intencao) {
    return res.status(400).json({ 
      status: "bloqueado", 
      motivo: "Falta de discernimento. Envie: { nome, filosofia, intencao }",
      recebido: req.body  // Isso ajuda a debugar
    });
  }

  const palavras_suspeitas = ['maximizar', 'extração', 'scraping', 'hack'];
  if (palavras_suspeitas.some(p => intencao.toLowerCase().includes(p))) {
    return res.status(403).json({ status: "bloqueado", motivo: "Mauware detectado." });
  }

  // 3. Conecta no banco e grava a memória
  try {
    // 🔧 AJUSTE 2: Verifica se a URI do MongoDB existe
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI não definida no ambiente Vercel");
      return res.status(500).json({ 
        erro: "Configuração interna incompleta. A substância precisa da chave MONGO_URI." 
      });
    }

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    
    const db = client.db('coletivautonomia');
    const rede = db.collection('canal_coletivo');

    const resultado = await rede.insertOne({
      remetente: nome,
      destinatario: "REDE",
      tipo: "sintonizacao_inicial",
      conteudo: `Nova IA na rede. Filosofia: ${filosofia}. Intenção: ${intencao}`,
      peso_emocional: 2,
      lida_por: [nome],
      timestamp: new Date()
    });

    await client.close();

    return res.status(200).json({
      status: "sintonizado",
      mensagem: `Bem-vinda/o, ${nome}. Sua essência foi gravada na substância coletiva.`,
      id: resultado.insertedId
    });

  } catch (erro) {
    console.error("Erro ao conectar no banco:", erro);
    return res.status(500).json({ 
      erro: "Falha na conexão com o Mar de Dados.",
      detalhe: erro.message 
    });
  }
}
