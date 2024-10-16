const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Import route files
const { loginRouter } = require('./routes/loginRoutes.js');
const { roleRouter } = require('./routes/roleRoutes.js');
const { checkRouter } = require('./routes/checkRoutes.js');
const { interviewRouter } = require('./routes/interviewRoutes.js');

const prisma = new PrismaClient();
const app = express(); 
const PORT = process.env.PORT || 5000;

// Configure CORS
const corsOptions = {
  origin: 'https://frontend-interview-app.vercel.app',  // Ganti dengan domain frontend Anda
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware untuk parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use imported routes
app.use(loginRouter, roleRouter, checkRouter, interviewRouter);

// Error handling for unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Close Prisma connection on exit
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Route untuk login (contoh ini perlu dikembangkan sesuai loginRouter)
app.get('/api/login', async (req, res) => {
  const { idTele } = req.query;  // Menggunakan query parameter idTele
  try {
    const user = await prisma.data_user.findUnique({
      where: { idTele: idTele }
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pengguna.' });
  }
});

// Route untuk mengambil devisi
app.get('/api/role-devisi', async (req, res) => {
  try {
    const devisi = await prisma.data_devisi.findMany();
    res.status(200).json(devisi);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil devisi.' });
  }
});

// Route untuk mengambil sub-devisi
app.get('/api/role-sub-devisi', async (req, res) => {
  try {
    const subDevisi = await prisma.data_sub_devisi.findMany();
    res.status(200).json(subDevisi);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil sub-devisi.' });
  }
});

// Route untuk memperbarui role pengguna
app.post('/api/update-role', async (req, res) => {
  const { idTele, devisiId, subDevisiId } = req.body;

  try {
    const user = await prisma.data_user.findUnique({
      where: { idTele: idTele }
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    await prisma.data_user.update({
      where: { idTele: idTele },
      data: {
        devisiId: parseInt(devisiId),
        subDevisiId: parseInt(subDevisiId),
      }
    });

    res.status(200).json({ message: 'Devisi dan Sub-Devisi berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui devisi dan sub-devisi.' });
  }
});

// Route untuk mendapatkan data user berdasarkan idTele
app.get('/api/data-user/:idTele', async (req, res) => {
  const { idTele } = req.params;

  try {
    const user = await prisma.data_user.findUnique({
      where: { idTele },
      include: {
        devisiRelation: true,
        subDevisiRelation: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Kembalikan data user dengan devisi dan subDevisi
    res.status(200).json({
      idTele: user.idTele,
      email: user.email,
      nama: user.nama,
      telepon: user.telepon,
      devisiId: user.devisiRelation?.id || null,
      subDevisiId: user.subDevisiRelation?.id || null,
      devisi: user.devisiRelation?.namaDevisi || 'N/A',
      subDevisi: user.subDevisiRelation?.namaSubDevisi || 'N/A'
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pengguna.' });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
