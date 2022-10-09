import mongoose, { Connection, Mongoose } from 'mongoose';

class Database {
  private readonly mongoSingleton: Mongoose;

  constructor(mongo: Mongoose) {
    this.mongoSingleton = mongo;
  }

  dbConnection() {
    const dbType = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    const url =
      `mongodb://${ 
      process.env.COSMOSDB_HOST 
      }:${ 
      process.env.COSMOSDB_PORT 
      }/${ 
      process.env.COSMOSDB_DBNAME 
      }?ssl=true&replicaSet=globaldb`;

    // const forceProd = false;

    // if (forceProd) {
    //   url = process.env.DB_PROD;
    //   dbType = 'prod';
    // }
    const configs = {
      // auth: {
      //   username: process.env.COSMOSDB_USER,
      //   password: process.env.COSMOSDB_PASSWORD
      // },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    };

    if (url) {
      this.mongoSingleton.connect(url, configs);
      const db: Connection = this.mongoSingleton.connection;
      db.on('error', console.error.bind(console, 'connection error:'));
      db.once('open', () => {
        console.log('DB connected of type: ', dbType);
      });
    }
  }

  get mongo() {
    return this.mongoSingleton;
  }
}

export default Object.freeze(new Database(mongoose));
