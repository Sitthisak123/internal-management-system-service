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

        // Bcrypt hashing here
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Creating admin user...');

        await prisma.users.create({
            data: {
                username,
                hash_pwd: hashedPassword,
                email,
                title: 'Administrator',
                role: 1,   // 1 = Superadmin
                status: 1, // 1 = Active
                
                // FIX: These fields are now directly in the users table
                fullname: 'System Admin', 
                position: 'System Administrator' 
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