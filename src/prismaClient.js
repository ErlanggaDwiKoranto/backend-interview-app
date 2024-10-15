// backend/prismaClient.js
const { PrismaClient } = require('@prisma/client');

// Instantiate Prisma client
const prisma = new PrismaClient();

module.exports = prisma;
