const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSubDevisi = async (req, res) => {
    try {
      const subDevisi = await prisma.data_sub_devisi.findMany();
      res.status(200).json(subDevisi);
    } catch (error) {
      console.error('Error fetching sub-devisi:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat mengambil sub-devisi.' });
    }
  };

module.exports = {getSubDevisi};