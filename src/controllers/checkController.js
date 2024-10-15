const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserByIdTele = async (req, res) => {
  const { idTele } = req.params;

  try {
    const user = await prisma.data_user.findUnique({
      where: { idTele },
      include: {
        devisiRelation: true,  // Ambil relasi devisi
        subDevisiRelation: true  // Ambil relasi sub devisi
      }
    });

    if (user) {
      // Ambil devisiId dan subDevisiId berdasarkan nama devisi dan subDevisi
      const devisi = await prisma.data_devisi.findUnique({
        where: { namaDevisi: user.devisi }
      });

      const subDevisi = await prisma.data_sub_devisi.findUnique({
        where: { namaSubDevisi: user.subDevisi }
      });

      if (!devisi || !subDevisi) {
        res.status(404).json({ message: 'Devisi or SubDevisi not found' });
        return;
      }

      res.json({
        idTele: user.idTele,
        email: user.email,
        nama: user.nama,
        telepon: user.telepon,
        devisiId: devisi.id,  // Kembalikan devisiId berdasarkan nama devisi
        subDevisiId: subDevisi.id,  // Kembalikan subDevisiId berdasarkan nama subDevisi
        devisi: user.devisiRelation?.namaDevisi || 'N/A',
        subDevisi: user.subDevisiRelation?.namaSubDevisi || 'N/A',
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pengguna' });
  }
};


const saveFolderLink = async (req, res) => {
  const { idTele, folderUrl } = req.body;
  try {
      await prisma.data_user.update({
          where: {
              idTele: idTele
          },
          data: {
              FolderLink: folderUrl 
          }
      });
      res.status(200).json({ message: 'Folder link saved successfully' });
  } catch (error) {
      console.error('Error saving folder link:', error);
      res.status(500).json({ message: 'Error saving folder link' });
  }
};

const getFolderLink = async (req, res) => {
  const { idTele } = req.params;  // Ambil idTele dari parameter URL
  try {
    const user = await prisma.data_user.findUnique({
      where: { idTele: idTele },  // Cari berdasarkan idTele
      select: { FolderLink: true }  // Ambil hanya FolderLink dari user
    });
    
    if (user && user.FolderLink) {
      res.status(200).json({ folderUrl: user.FolderLink });  // Kembalikan folder link
    } else {
      res.status(404).json({ message: 'Folder link not found' });  // Jika tidak ada folder link
    }
  } catch (error) {
    console.error('Error fetching folder link:', error);
    res.status(500).json({ message: 'Error fetching folder link' });
  }
};

module.exports = { getUserByIdTele, saveFolderLink,getFolderLink };
