const fs = require("fs");
const axios = require("axios");

/** Textual Markov Chain Generator */
class MarkovMachine {
  constructor(text) {
    let words = text.split(/[ \r\n]+/);
    this.words = words.filter((c) => c !== "");
    this.makeChains();
  }

  /** Build chains of word -> possible next words */
  makeChains() {
    this.chains = new Map();

    for (let i = 0; i < this.words.length; i++) {
      let word = this.words[i];
      let nextWord = this.words[i + 1] || null;

      if (!this.chains.has(word)) {
        this.chains.set(word, []);
      }
      this.chains.get(word).push(nextWord);
    }
  }

  /** Pick a random element from an array */
  choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /** Generate random text based on Markov chains */
  makeText(numWords = 100) {
    let keys = Array.from(this.chains.keys());
    let key = this.choice(keys);
    let output = [];

    while (output.length < numWords && key !== null) {
      output.push(key);
      key = this.choice(this.chains.get(key));
    }

    return output.join(" ");
  }
}

/** Generate text from input */
function generateFromText(text) {
  let mm = new MarkovMachine(text);
  console.log(mm.makeText());
}

/** Generate text from a file */
function generateFromFile(filename) {
  fs.readFile(filename, "utf8", (err, data) => {
    if (err) {
      console.error(`Cannot read file: ${filename}: ${err}`);
      process.exit(1);
    } else {
      generateFromText(data);
    }
  });
}

/** Generate text from a URL */
async function generateFromURL(url) {
  try {
    let resp = await axios.get(url);
    generateFromText(resp.data);
  } catch (err) {
    console.error(`Cannot fetch URL: ${url}: ${err}`);
    process.exit(1);
  }
}

/** Main Script Logic */
let [method, path] = process.argv.slice(2);

if (method === "file") {
  generateFromFile(path);
} else if (method === "url") {
  generateFromURL(path);
} else {
  console.error("Usage: node markov.js file|url <path>");
  process.exit(1);
}
