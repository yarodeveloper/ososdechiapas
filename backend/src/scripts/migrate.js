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
            const cleanQuery = query.split('\n')
                .filter(line => !line.trim().startsWith('--'))
                .join(' ')
                .trim();
                
            if (cleanQuery.length === 0) continue;
            
            try {
                await db.query(cleanQuery);
                console.log('Executed:', cleanQuery.substring(0, 50) + '...');
            } catch (queryErr) {
                console.warn('Query failed (skipping):', cleanQuery.substring(0, 50) + '...', queryErr.message);
            }
        }
        console.log('Migration process finished!');
    } catch (error) {
        console.error('Fatal Migration error:', error);
    } finally {
        process.exit();
    }
};

migrate();
