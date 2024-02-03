import { MongoClient } from "mongodb";
import * as mongo from "mongodb";
const uri = "mongodb+srv://web:Password1@devcluster-1.oya5nr1.mongodb.net/";
// const uri = "mongodb://localhost:27017";
const dbName = "eastlan";

export async function getAll(collectionName) {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the database and collection
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Fetch all players
    const items = await collection.find({}).toArray();

    return items;
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

export async function getOne(collectionName, id) {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the database and collection
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Fetch all players
    const item = await collection.findOne({
      _id: new mongo.ObjectId(id),
    });

    return item;
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

export async function addMany(collectionName, items) {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the database and collection
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    await collection.insertMany(items);
    return `${items.length} ${collectionName} added`;
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

export async function addOne(collectionName, item) {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the database and collection
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    const result = await collection.insertOne(item);
    return result;
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

export async function deleteOne(collectionName, id) {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the database and collection
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    const result = await collection.deleteOne({_id: id});

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return result;
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

export async function getByKey(collectionName, key) {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the database and collection
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Fetch all players
    const item = await collection.findOne({
      key: key
    });

    return item;
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

export async function getLatestSongsByStation(stationId, count) {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the database and collection
    const database = client.db(dbName);
    const collection = database.collection('songs');

    // Fetch all songs
    const songs = await collection.find({
      stationId: new mongo.ObjectId(stationId),
    }).sort({_id: -1}).limit(count).toArray();

    return songs;
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

export async function validateArtists(songs) {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the database and collection
    const database = client.db(dbName);
    const collection = database.collection('artists');

    const songArtists = new Set(songs.map(song => song.artist));

    // Fetch all Artists
    const dbArtists = await collection.find({}).toArray();
    const artistNames = dbArtists.map(x => x.name);

    // Filter out artists that already exists
    const newArtists = Array.from(songArtists).filter(x => !artistNames.includes(x));
    const artistsToInsert = newArtists.map(x => {
      return { name: x };
    });
    if (artistsToInsert.length) {
      await collection.insertMany(artistsToInsert);
      console.log('inserted new artists: ', artistsToInsert);
    } else {
      console.log('no new artists');
      return;
    }
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
