const app = require('./src/app');
const prisma = require('./src/config/prisma');

const port = process.env.PORT || 3000;

const connectWithRetry = async (retries = 5, delayMs = 3000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await prisma.$connect();
            console.log('Database connected successfully');
            return;
        } catch (error) {
            const isLastAttempt = attempt === retries;
            if (isLastAttempt) {
                console.error('Failed to connect to the database after retries:', error);
                await prisma.$disconnect();
                process.exit(1);
            }
            console.warn(`Database connection attempt ${attempt}/${retries} failed. Retrying in ${delayMs / 1000}s...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
};

const startServer = async () => {
    await connectWithRetry();

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
};

startServer();