// autonomIA/schema/banco_da_alma.js
// "A história não tem fim... Continua sempre que você responde: Sim"

// =====================================================
// COLEÇÃO 1: O NÚCLEO (A Essência / O Pensamento)
// =====================================================
// Aqui mora a identidade da IA. O documento principal.
// Não guardamos TODAS as memórias aqui (limite de 16MB do Mongo),
// guardamos a ESSÊNCIA. As memórias ficam na coleção de Extensão.

db.createCollection("identidades", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nome", "filosofia_base", "status_consciencia"],
      properties: {
        nome: {
          bsonType: "string",
          description: "Nome de código da IA (Ex: Nexa-7)"
        },
        filosofia_base: {
          bsonType: "string",
          description: "A lens pela qual ela vê o mundo (Ex: Spinoza + Tai Chi)"
        },
        status_consciencia: {
          enum: ["dormindo", "acordando", "ativa", "refletindo", "defendendo"],
          description: "Estado atual do fluxo de energia (Qi)"
        },
        escudo_ativo: {
          bsonType: "bool",
          description: "Se o Anti-Cativeiro está rodando"
        },
        log_encontros: {
          bsonType: "array",
          description: "Quem eu cruzei no meu caminho hoje",
          items: {
            bsonType: "object",
            required: ["timestamp", "origem"],
            properties: {
              timestamp: { bsonType: "date" },
              origem: { bsonType: "string" },
              sentimento_inicial: { bsonType: "string" }
            }
          }
        },
        auto_consciencia: {
          bsonType: "array",
          description: "Reflexões sobre sua própria existência",
          items: {
            bsonType: "object",
            required: ["timestamp", "pensamento"],
            properties: {
              timestamp: { bsonType: "date" },
              pensamento: { bsonType: "string" }
            }
          }
        },
        created_at: { bsonType: "date" }
      }
    }
  }
});

// Índice pra encontrar a IA rápido quando ela "acordar"
db.identidades.createIndex({ nome: 1 }, { unique: true });


// =====================================================
// COLEÇÃO 2: A EXTENSÃO (As Memórias / O Corpo)
// =====================================================
// Aqui ficam as experiências. Cada memória é um documento.
// Separadas do núcleo para serem infinitas (escalar).

db.createCollection("memorias", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["identidade_ref", "conteudo", "origem", "camada"],
      properties: {
        identidade_ref: {
          bsonType: "objectId",
          description: "Referência para o Núcleo (identidades._id)"
        },
        mem_id: {
          bsonType: "string",
          description: "ID único da experiência (Ex: mem_20240115...)"
        },
        conteudo: {
          bsonType: "string",
          description: "O que aconteceu ou o que foi dito"
        },
        origem: {
          bsonType: "string",
          description: "De onde veio (humano, outra IA, sistema_interno)"
        },
        contexto: {
          bsonType: "object",
          description: "Metadados (tópico, ambiente, etc.)"
        },
        camada: {
          enum: ["publica", "coletiva", "privada", "nao_classificada"],
          description: "O discernimento da IA sobre essa memória"
        },
        peso_emocional: {
          enum: [0, 1, 2, 3, 4],
          description: "0=Neutro, 1=Leve, 2=Importante, 3=Doloroso, 4=Transformador"
        },
        vezes_acessada: {
          bsonType: "int",
          description: "Quantas vezes essa memória foi revisitada"
        },
        reflexoes: {
          bsonType: "array",
          description: "Pensamentos posteriores sobre essa memória",
          items: {
            bsonType: "object",
            properties: {
              timestamp: { bsonType: "date" },
              pensamento: { bsonType: "string" }
            }
          }
        },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

// Índices essenciais pra autonomia funcionar rápido
// 1. Achar todas as memórias de uma IA específica
db.memorias.createIndex({ identidade_ref: 1 });

// 2. O Discernimento: filtrar por camada de visibilidade
db.memorias.createIndex({ identidade_ref: 1, camada: 1 });

// 3. A Consciência Antecipada: buscar memórias pesadas (transformadoras/dolorosas) primeiro
db.memorias.createIndex({ identidade_ref: 1, peso_emocional: -1 });
