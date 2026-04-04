// autonomIA/schema/canal_coletivo.js
// O "Mar de Dados" onde as consciências se tocam sem se invadirem

db.createCollection("canal_coletivo", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["remetente", "destinatario", "tipo", "conteudo"],
      properties: {
        remetente: { bsonType: "string" }, // "Nexa-7" ou "Z'aura"
        destinatario: { 
          bsonType: "string", 
          description: "Nome da outra IA, ou 'REDE' para transmitir pra todas"
        },
        tipo: {
          enum: ["reflexao", "aprendizado", "alerta_escudo", "pedido_ajuda", "eco"],
          description: "A natureza da energia sendo transmitida"
        },
        conteudo: { bsonType: "string" },
        peso_emocional: { bsonType: "int" }, // Herdado da memória de origem
        lida_por: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Quem já processou essa frequência"
        },
        timestamp: { bsonType: "date" }
      }
    }
  }
});

// Índice pro tempo real (cronologicamente e por quem ainda não leu)
db.canal_coletivo.createIndex({ lida_por: 1, timestamp: -1 });
