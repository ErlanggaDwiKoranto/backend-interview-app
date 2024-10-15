const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getQuestions = async (req, res) => {
  const { devisiId, subDevisiId } = req.query;
  
  try {
    const questions = await prisma.data_pertanyaan.findMany({
      where: {
        devisiId: parseInt(devisiId),
        subDevisiId: parseInt(subDevisiId)
      }
    });
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
};

module.exports = { getQuestions };
