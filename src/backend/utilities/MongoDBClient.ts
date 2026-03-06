import { MongoClient } from 'mongodb';

export const getDbConnection = async () => {
  const connStr = process.env.MONGO_DB_URL;
  if(!connStr){
    console.error("Error in Mongo DB connection string")
    return;
  }
  const client = await MongoClient.connect(connStr);
  return client.db("pka2");
};
