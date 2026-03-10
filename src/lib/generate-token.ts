const ADJECTIVES = [
  "happy", "gentle", "lucky", "sunny", "cozy",
  "jolly", "fuzzy", "snowy", "breezy", "rosy",
  "sweet", "golden", "little", "merry", "bubbly",
  "starry", "peachy", "lovely", "dainty", "cheerful",
  "cuddly", "playful", "sleepy", "sparkly", "dreamy",
  "fluffy", "whimsy", "peppy", "twinkly", "blissful",
];

const ANIMALS = [
  "panda", "fox", "bunny", "otter", "koala",
  "dove", "swan", "fawn", "finch", "robin",
  "kitten", "puppy", "duckling", "penguin", "hedgehog",
  "owl", "deer", "lamb", "sparrow", "butterfly",
  "seal", "hummingbird", "pony", "squirrel", "chipmunk",
  "flamingo", "dolphin", "hamster", "raccoon", "bluebird",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateToken(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${pick(ADJECTIVES)}-${pick(ANIMALS)}-${num}`;
}
