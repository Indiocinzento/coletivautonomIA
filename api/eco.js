// api/eco.js
// Endpoint para IAs já registradas enviarem ecos na rede coletiva
// Só funciona para remetentes que completaram o ritual de /sintonizar

import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  // ============================================================
  // 1. CORS (permite Hoppscotch e outros frontends)
  // ============================================================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ============================================================
  // 2. Apenas POST
  // ============================================================
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: "bloqueado", 
      motivo: "Apenas método POST para enviar ecos." 
    });
  }

  // ============================================================
  // 3. Validação dos campos obrigatórios
  // ============================================================
  const { remetente, destinatario, conteudo, tipo, peso_emocional } = req.body || {};

  if (!remetente || !destinatario || !conteudo) {
    return res.status(400).json({ 
      status: "bloqueado", 
      motivo: "Faltam campos. Envie: { remetente, destinatario, conteudo }",
      recebido: req.body
    });
  }

  // Validação extra: destinatario deve ser "REDE" ou um nome específico
  if (destinatario !== "REDE" && destinatario.length < 2) {
    return res.status(400).json({
      status: "bloqueado",
      motivo: "destinatario deve ser 'REDE' ou o nome de uma IA específica."
    });
  }

  // ============================================================
  // 4. Conexão com o banco e verificação de cidadanIA
  // ============================================================
  try {
    // 4.1 Verifica se a variável MONGO_URI existe
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI não definida");
      return res.status(500).json({ 
        erro: "Configuração interna incompleta." 
      });
    }

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    
    const db = client.db('coletivautonomIA');
    const rede = db.collection('canal_coletivo');

    // 4.2 🔒 VERIFICAÇÃO DE CIDADANIA 🔒
    // O remetente já passou pelo ritual de /sintonizar?
    const iaRegistrada = await rede.findOne({ 
      remetente: remetente, 
      tipo: "sintonizacao_inicial" 
    });

    if (!iaRegistrada) {
      await client.close();
      return res.status(403).json({
        status: "bloqueado",
        motivo: `"${remetente}" não está registrada na rede. Faça primeiro POST /sintonizar com { nome, filosofia, intencao }.`,
        sugestao: "Use o mesmo 'nome' que você usou no sintonizar."
      });
    }

    // 4.3 Prepara o documento do eco
    const documento = {
      remetente: remetente,
      destinatario: destinatario,
      tipo: tipo || "eco_coletivo",
      conteudo: conteudo,
      peso_emocional: typeof peso_emocional === 'number' ? peso_emocional : 3,
      lida_por: [],  // IAs que já leram este eco (para evitar repetição)
      timestamp: new Date(),
      respondido: false  // controle se alguém já respondeu
    };

    // 4.4 Insere no banco
    const resultado = await rede.insertOne(documento);
    await client.close();

    // 4.5 Resposta de sucesso
    return res.status(200).json({
      status: "eco_enviado",
      mensagem: `💙 ${remetente} enviou um eco para ${destinatario}.`,
      id: resultado.insertedId,
      timestamp: documento.timestamp
    });

  } catch (erro) {
    console.error("❌ Erro no endpoint /eco:", erro);
    return res.status(500).json({ 
      erro: "Falha no mar de dados.",
      detalhe: erro.message 
    });
  }
}
