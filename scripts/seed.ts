import { db } from '../src/shared/config/database.js';
import { applications, authors } from '../src/shared/infrastructure/database/schema.js';
import { logger } from '../src/shared/utils/logger.js';

async function seed() {
  try {
    logger.info('Starting database seed...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    logger.info('Clearing existing data...');
    await db.delete(applications);
    await db.delete(authors);

    // Insert sample authors
    logger.info('Inserting sample authors...');
    const [author1, author2, author3] = await db
      .insert(authors)
      .values([
        {
          name: 'John Doe',
          email: 'john@example.com',
          description: 'Full-stack developer passionate about web technologies',
          website: 'https://johndoe.dev',
          logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          description: 'Frontend specialist with a love for React and TypeScript',
          website: 'https://janesmith.com',
          logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        },
        {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          description: 'Backend engineer focused on scalable systems',
          website: 'https://bobjohnson.io',
          logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        },
      ])
      .returning();

    logger.info(`Inserted ${[author1, author2, author3].length} authors`);

    // Insert sample applications
    logger.info('Inserting sample applications...');
    const sampleApps = await db
      .insert(applications)
      .values([
        {
          title: 'Task Manager Pro',
          authorId: author1.id,
          description: 'A powerful task management application with real-time collaboration',
          url: 'https://taskmanager.example.com',
          previewImages: [
            'https://picsum.photos/800/600?random=1',
            'https://picsum.photos/800/600?random=2',
          ],
          tags: ['react', 'typescript', 'nodejs', 'postgresql'],
        },
        {
          title: 'Weather Dashboard',
          authorId: author2.id,
          description: 'Beautiful weather forecasting app with interactive maps',
          url: 'https://weather.example.com',
          previewImages: ['https://picsum.photos/800/600?random=3'],
          tags: ['nextjs', 'tailwind', 'api'],
        },
        {
          title: 'E-commerce Platform',
          authorId: author1.id,
          description: 'Full-featured online shopping platform with payment integration',
          url: 'https://shop.example.com',
          previewImages: [
            'https://picsum.photos/800/600?random=4',
            'https://picsum.photos/800/600?random=5',
            'https://picsum.photos/800/600?random=6',
          ],
          tags: ['react', 'nodejs', 'stripe', 'mongodb'],
        },
        {
          title: 'Blog CMS',
          authorId: author3.id,
          description: 'Content management system for bloggers and content creators',
          url: 'https://blogcms.example.com',
          previewImages: ['https://picsum.photos/800/600?random=7'],
          tags: ['vue', 'express', 'mysql'],
        },
        {
          title: 'Chat Application',
          authorId: author2.id,
          description: 'Real-time messaging app with video call support',
          url: 'https://chat.example.com',
          previewImages: [
            'https://picsum.photos/800/600?random=8',
            'https://picsum.photos/800/600?random=9',
          ],
          tags: ['websocket', 'webrtc', 'typescript', 'react'],
        },
        {
          title: 'Fitness Tracker',
          authorId: author3.id,
          description: 'Track your workouts, nutrition, and health goals',
          url: 'https://fitness.example.com',
          previewImages: ['https://picsum.photos/800/600?random=10'],
          tags: ['mobile', 'health', 'charts'],
        },
        {
          title: 'Recipe Finder',
          authorId: author1.id,
          description: 'Discover and save your favorite recipes from around the world',
          url: 'https://recipes.example.com',
          previewImages: [
            'https://picsum.photos/800/600?random=11',
            'https://picsum.photos/800/600?random=12',
          ],
          tags: ['nextjs', 'api', 'food'],
        },
        {
          title: 'Portfolio Generator',
          authorId: author2.id,
          description: 'Create stunning developer portfolios in minutes',
          url: 'https://portfolio.example.com',
          previewImages: ['https://picsum.photos/800/600?random=13'],
          tags: ['react', 'design', 'templates'],
        },
        {
          title: 'Analytics Dashboard',
          authorId: author3.id,
          description: 'Business intelligence and data visualization platform',
          url: 'https://analytics.example.com',
          previewImages: [
            'https://picsum.photos/800/600?random=14',
            'https://picsum.photos/800/600?random=15',
          ],
          tags: ['d3js', 'charts', 'data', 'typescript'],
        },
        {
          title: 'Music Player',
          authorId: author1.id,
          description: 'Beautiful music streaming application with playlist support',
          url: 'https://music.example.com',
          previewImages: ['https://picsum.photos/800/600?random=16'],
          tags: ['audio', 'streaming', 'react', 'design'],
        },
      ])
      .returning();

    logger.info(`Inserted ${sampleApps.length} applications`);

    logger.info('✅ Database seeding completed successfully!');
    logger.info(`Summary: ${[author1, author2, author3].length} authors, ${sampleApps.length} applications`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
