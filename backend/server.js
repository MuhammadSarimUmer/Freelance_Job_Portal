const app = require('./src/app');
const prisma = require('./src/config/prisma');

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');

        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

        const shutdown = async () => {
            console.log('Shutting down gracefully...');
            server.close(async () => {
                await prisma.$disconnect();
                console.log('Database disconnected');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

startServer();