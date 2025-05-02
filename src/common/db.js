import { MongoClient } from 'mongodb';
import { format } from 'util';

export class MongoManager {
    mongo = null;
    dbs = new Map();

    constructor(username, password, host = 'localhost', port = '27017') {
        this.username = username;
        this.password = password;
        this.host = host;
        this.port = port;
    }

    createConnection () {
        const uri = format('mongodb://%s:%s@%s:%s', this.username, this.password, this.host, this.port);
        this.mongo = new MongoClient(uri);
    }

    async connect() {
        console.log('Connecting to DB');
        const connected = await this.mongo.connect();
        console.log('Connected to DB');
        return connected;
    }

    getConnection () {
        return this.mongo;
    }

    createDb (name) {
        if (!this.dbs.has(name)) {
            this.dbs.set(name, new DatabaseManager(this, name));
        }

        return this.dbs.get(name);
    }
}

export class DatabaseManager {
    mongoDatabase = null;
    mongoConnection = null;
    collections = new Map();

    constructor(mongoConnection, dbname) {
        this.mongoConnection = mongoConnection;
        this.mongoDatabase = mongoConnection.getConnection().db(dbname);
    }

    collection(name) {
        if (!this.collections.has(name)) {
            this.collections.set(name, this.mongoDatabase.collection(name));
        }

        return this.collections.get(name);
    }
}

const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_PORT } = process.env;
const mongoManager = new MongoManager(MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_PORT);
mongoManager.createConnection();
await mongoManager.connect();

export default mongoManager;