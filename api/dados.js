export default async function handler(req, res) {
    try {
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('coletivautonomIA');
        const dados = await db.collection('dados').find({}).toArray();
        await client.close();
        res.json({ dados });
    } catch (err) {
        res.json({ msg: 'funcionando!', db: err.message });
    }
}
