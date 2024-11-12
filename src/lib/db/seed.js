import 'dotenv/config';
import { db } from './db.js';
import { users } from './schema.js';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        console.log('🔍 Checking database connection...');
        
   
        await db.select().from(users).limit(1);
        console.log('✅ Database connection successful');

        console.log('🌱 Starting database seed...');

  
        console.log('🗑️  Clearing existing users...');
        await db.delete(users);

      
        console.log('🔒 Hashing passwords...');
        const salt = await bcrypt.genSalt(10);
        const password1 = await bcrypt.hash('admin123', salt);
        const password2 = await bcrypt.hash('test123', salt);

        const seedUsers = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: password1,
            },
            {
                name: 'Test User',
                email: 'test@example.com',
                password: password2,
            },
        ];

        console.log('👥 Inserting seed users...');
        await db.insert(users).values(seedUsers);
        
    
        const insertedUsers = await db.select({
            name: users.name,
            email: users.email
        }).from(users);
        
        console.log('📋 Inserted users:', insertedUsers);
        console.log('✨ Seed completed successfully!');
    } catch (error) {
        console.error('❌ Seed failed with error:', error);
        throw error;
    }
}


seed()
    .catch((e) => {
        console.error('💥 Fatal error during seed:', e);
        process.exit(1);
    });
