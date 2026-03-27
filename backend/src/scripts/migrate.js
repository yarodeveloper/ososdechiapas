import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrate = async () => {
    try {
        const schemaPath = path.join(__dirname, '..', '..', 'alter_schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        const queries = sql.split(';').filter(q => q.trim().length > 0);
        
        for (let query of queries) {
            if(query.trim().startsWith('--')) continue;
            await db.query(query);
            console.log('Executed:', query.substring(0, 50).replace(/\n/g, ' ') + '...');
        }
        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
};

migrate();
