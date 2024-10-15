const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updateRole = async (req, res) => {
    const { idTele, devisi, subDevisi } = req.body;
  
    if (!idTele || !devisi || !subDevisi) {
      return res.status(400).json({ error: 'ID Telegram, Devisi, dan Sub-Devisi harus diisi' });
    }
  
    try {
      // Ubah ID devisi dan sub-devisi menjadi integer jika diperlukan
      const devisiId = parseInt(devisi, 10);
      const subDevisiId = parseInt(subDevisi, 10);
  
      // Periksa apakah devisi valid
      const validDevisi = await prisma.data_devisi.findUnique({
        where: { id: devisiId }
      });
  
      if (!validDevisi) {
        return res.status(400).json({ error: 'Devisi tidak ditemukan' });
      }
  
      // Periksa apakah subDevisi valid
      const validSubDevisi = await prisma.data_sub_devisi.findUnique({
        where: { id: subDevisiId }
      });
  
      if (!validSubDevisi) {
        return res.status(400).json({ error: 'Sub-Devisi tidak ditemukan' });
      }
  
      // Lakukan pembaruan
      const updateResult = await prisma.data_user.update({
        where: { idTele: idTele },
        data: { devisi: validDevisi.namaDevisi, subDevisi: validSubDevisi.namaSubDevisi },
      });
  
      res.status(200).json({ message: 'update berhasil' });
    } catch (error) {
      console.error('Error updating devisi:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui data devisi.' });
    }
  };
  module.exports = {updateRole};