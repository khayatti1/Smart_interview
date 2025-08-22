import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const ceoEmail = 'ceo@smart-interview.com';
  const existingCeo = await prisma.user.findUnique({ where: { email: ceoEmail } });

  if (!existingCeo) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        name: 'CEO Admin',
        email: ceoEmail,
        password: hashedPassword,
        role: 'CEO',
      },
    });
    console.log('CEO account created. Email: ceo@smart-interview.com, Password: password123');
  } else {
    console.log('CEO account already exists.');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
