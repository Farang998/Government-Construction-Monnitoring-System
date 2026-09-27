import path from 'path';

let instance: any = null;

export const startEmbeddedPg = async (port = 5432, dbName = 'gov_construction_db') => {
  let EmbeddedPostgres: any;
  try {
    EmbeddedPostgres = require('embedded-postgres');
  } catch (e) {
    console.warn('embedded-postgres package not available');
    return null;
  }
  const dbPath = path.join(process.cwd(), '.pgdata');
  
  instance = new EmbeddedPostgres({
    port,
    databasePath: dbPath,
    user: 'postgres',
    password: 'postgrespassword',
    persistent: true,
  });

  try {
    await instance.initialise();
  } catch (_e) {
    // Directory initialized
  }

  try {
    await instance.start();
    try {
      await instance.createDatabase(dbName);
    } catch (_e) {
      // Database exists
    }
  } catch (err: unknown) {
    // Server already running or port in use
  }

  return instance;
};

export const stopEmbeddedPg = async () => {
  if (instance) {
    try {
      await instance.stop();
    } catch (_e) {
      // Ignored
    }
  }
};

if (require.main === module) {
  startEmbeddedPg().then(() => {
    console.log('Embedded PostgreSQL server runner active.');
  });
}
