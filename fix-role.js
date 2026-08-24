const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.user.update({
    where: { email: 'amanshukla@cartigo.admin' },
    data: { role: 'SUPER_ADMIN' }
  });
  console.log('User role updated to SUPER_ADMIN');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
