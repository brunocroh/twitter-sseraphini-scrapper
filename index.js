import 'dotenv/config'
import { Client } from 'twitter-api-sdk'
import { insertPost } from './db.js'

const client = new Client(process.env.BARER_TOKEN)

async function getTweets(next){
  const tweets = await client.tweets.tweetsRecentSearch({
    'query': 'is:retweet from:sseraphini',
    'next_token': next || '',
    'max_results': 100,
    'tweet.fields': 'referenced_tweets',
    'expansions': 'referenced_tweets.id'
  })

  const ids = tweets.data.map(t => t.referenced_tweets[0].id)

  const result = await client.tweets.findTweetsById({
    'ids': ids,
    'tweet.fields': 'public_metrics,lang',
  })

  return {
    ...result,
    meta: tweets.meta
  }
}

async function main() {
  let next = null;
  for (let i = 0, len = 1000; i < len; i++) {
    const result = await getTweets(next)
    next = result.meta.next_token
    if (!next) {
      break
    }
    await Promise.all(result.data.map((post) => insertPost(post)))
  }

  process.exit(0)
}

main();

