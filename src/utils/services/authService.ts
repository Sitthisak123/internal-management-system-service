import express from 'express'
import createPrismaClient from "../db";

const Router = express.Router();
const prisma = createPrismaClient();

Router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const user = await prisma.users.findUnique({
            where: { username },
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default Router;