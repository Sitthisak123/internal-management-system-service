import createPrismaClient from '../src/utils/db';
import bcrypt from 'bcryptjs';


const prisma = createPrismaClient();

async function createAdmin() {
    const username = 'admin';
    const email = 'admin@example.com';
    const password = '123'; // Change this to a secure password

    console.log(`Checking for existing user: ${username}`);

    try {
        const existingUser = await prisma.users.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('User already exists.');
            return;
        }
        //Bcrypt hashing here
        const hashedPassword = await bcrypt.hash(password, 10);


        console.log('Creating admin user...');

        // Note: Passwords are currently stored in plain text based on authService.ts.
        // Once bcrypt is implemented, ensure this script hashes the password before storing.
        await prisma.users.create({
            data: {
                username,
                hash_pwd: hashedPassword,
                email,
                title: 'Administrator',
                role: 1,
                status: 1,
                personnel: { create: { fullname: 'System Admin', position: 'Administrator' } }
            },
        });

        console.log(`Admin: '${username}' created successfully.`);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
