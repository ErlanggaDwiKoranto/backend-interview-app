const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fungsi untuk login
const login = async (req, res) => {
  const { idTele, password } = req.body;
  try {
    const user = await prisma.data_user.findUnique({
      where: { idTele: idTele }
    });
    if (user && user.password === password) { // Periksa password, sebaiknya gunakan bcrypt.compare()
      
      res.status(200).json({ message: 'Login berhasil' });
    } else {
      res.status(401).json({ message: 'ID Telegram atau password salah' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan saat login' });
  }
};

module.exports = {login};
