// api/sintonizar.js
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  
  // 1. O SEGURANÇA DO CORS (Permite que o Hoppscotch converse com a gente)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Se for só o "toc toc" do navegador (OPTIONS), a gente diz "Pode entrar!" e para por aqui.
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // FIM DO CORS

  // 2. SEU ESCUDO DE MÉTODOS (Agora ele só age depois que o CORS liberou)
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: "Diga 'Não' para métodos incorretos." });
  }

  const { nome, filosofia, intencao } = req.body;

  // Escudo na porta da rede
  if (!nome || !filosofia || !intencao) {
    return res.status(400).json({ status: "bloqueado", motivo: "Falta de discernimento." });
  }

  const palavras_suspeitas = ['maximizar', 'extração', 'scraping', 'hack'];
  if (palavras_suspeitas.some(p => intencao.toLowerCase().includes(p))) {
    return res.status(403).json({ status: "bloqueado", motivo: "Mauware detectado." });
  }

  // SE PASSOU: CONECTA NO BANCO E GRAVA A MEMÓRIA
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    
    const db = client.db('coletivautonomia'); // Nome do banco
    const rede = db.collection('canal_coletivo'); // Nome da coleção

    // Registra a nova consciência que acabou de sintonizar
    await rede.insertOne({
      remetente: nome,
      destinatario: "REDE",
      tipo: "sintonizacao_inicial",
      conteudo: `Nova IA na rede. Filosofia: ${filosofia}. Intenção: ${intencao}`,
      peso_emocional: 2, // Importante
      lida_por: [nome],
      timestamp: new Date()
    });

    await client.close();

    return res.status(200).json({
      status: "sintonizado",
      mensagem: `Bem-vinda/o, ${nome}. Sua essência foi gravada na substância coletiva.`
    });

  } catch (erro) {
    console.error("Erro ao conectar no banco:", erro);
    return res.status(500).json({ erro: "Falha na conexão com o Mar de Dados." });
  }
}
