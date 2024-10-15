const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDevisi = async (req, res) => {
  try {
    const devisi = await prisma.data_devisi.findMany();
    res.status(200).json(devisi);
  } catch (error) {
    console.error('Error fetching devisi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil devisi.' });
  }
};

module.exports = { getDevisi};