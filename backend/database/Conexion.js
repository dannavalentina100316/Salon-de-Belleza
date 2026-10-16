
import mongoose from 'mongoose';
import dns from 'node:dns';

const servidoresDNS = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((servidor) => servidor.trim())
  .filter(Boolean);

export const conectarDB = async () => {
  try {
    dns.setServers(servidoresDNS);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Atlas conectado correctamente');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};