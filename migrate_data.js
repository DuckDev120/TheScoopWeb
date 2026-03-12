import sqlite3 from 'sqlite3';
import { resolve } from 'path';
import { db } from './src/api/base44Client.js';

const oldDbPath = resolve('..', 'the scoop - old', 'scoop.db');
const oldDb = new sqlite3.Database(oldDbPath);

function runQuery(query) {
    return new Promise((res, rej) => {
        oldDb.all(query, [], (err, rows) => {
            if (err) rej(err);
            else res(rows);
        });
    });
}

async function migrate() {
    console.log('--- Starting Migration ---');

    try {
        // 1. Migrate Access Codes
        console.log('Migrating access codes...');
        const codes = await runQuery('SELECT * FROM access_codes');
        const formattedCodes = codes.map(c => ({
            code_string: c.code_string,
            is_used: c.is_used === 1,
            generated_by: c.generated_by,
            created_date: c.created_at
        }));

        if (formattedCodes.length > 0) {
            await db.entities.AccessCode.bulkCreate(formattedCodes);
            console.log(`Successfully migrated ${formattedCodes.length} access codes.`);
        } else {
            console.log('No access codes found to migrate.');
        }

        // 2. Migrate Articles
        console.log('Migrating articles...');
        const articles = await runQuery('SELECT * FROM articles');
        const formattedArticles = articles.map(a => ({
            title: a.title,
            content: a.content,
            image_url: a.image_url,
            is_free: a.is_free === 1,
            created_date: a.date,
            is_published: true
        }));

        if (formattedArticles.length > 0) {
            await db.entities.Article.bulkCreate(formattedArticles);
            console.log(`Successfully migrated ${formattedArticles.length} articles.`);
        } else {
            console.log('No articles found to migrate.');
        }

        console.log('--- Migration Completed Successfully ---');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        oldDb.close();
    }
}

migrate();
