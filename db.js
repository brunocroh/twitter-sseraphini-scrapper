import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// this is a top-level await 
let db = null;
(async () => {
    // open the database
    db = await open({
      filename: './database.db',
      driver: sqlite3.Database
    })

     await db.exec(`
       CREATE TABLE posts(
         id TEXT PRIMARY KEY,
         author_id TEXT,
         text TEXT,
         retweet INTEGER,
         reply INTEGER,
         like INTEGER,
         quote INTEGER,
         rating INTEGER,
         url TEXT,
         lang TEXT
       )
     `)
})()

export async function insertPost(post){
  let result = null;
  try {
    const { retweet_count, reply_count, like_count, quote_count } = post.public_metrics
    const rating = like_count + retweet_count + quote_count * 3 + reply_count * 2
    const url = `https://twitter.com/tweet/status/${post.id}`
    result = await db.run(
      'INSERT INTO posts (id, author_id, text, like, retweet, reply, quote, rating, url, lang) VALUES (:col, :author, :text, :like, :retweet, :reply, :quote, :rating, :url, :lang)',
      {
        ':col': post.id,
        ':author': post.author_id,
        ':text': post.text,
        ':retweet': retweet_count,
        ':reply': reply_count,
        ':like': like_count,
        ':quote': quote_count,
        ':rating': rating,
        ':url': url,
        ':lang': post.lang,
      }
    )
    
  } catch (e) {
    console.log('error', e);
  }

  return result
}
