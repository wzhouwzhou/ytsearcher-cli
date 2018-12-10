#!/usr/bin/env node
'use strict';
const util = require('util'), { YTSearcher } = require('ytsearcher');
const w = process.stdout.columns, reg = /^Error code: (\d+)$/;
process.on('unhandledRejection', err => {
  console.error(`\n${'='.repeat(w)}\n An unexpected error occured...
    Please report this to the package maintainers: https://github.com/wzhouwzhou/ytsearcher-cli/issues\n${'='.repeat(w)}\n`);
  console.error(`${'='.repeat(w)}\n ${err.stack}\n${'='.repeat(w)}\n`);
  process.exit(1);
});

(async function __main__() {
  const [,, apikey, test, ..._search] = process.argv;
  if (!apikey) return console.log('No API key specified! Usage: ytsearcher-cli [API_Key] [search terms]');
  if (!test) return console.log('No search query specified! Usage: ytsearcher-cli [API_Key] [search terms]');
  const query = [test, _search].join(' ').trim(); let results;
  try {
    results = await new YTSearcher(apikey).search(query);
    if (!results.first) {
      console.log(`No results for [${query}]!`);
      process.exit(0);
    }
  } catch(err) {
    const msg = `${err.message}`;
    if (!reg.test(msg)) throw err;
    const [, status] = msg.match(reg) || [];
    if (+status === 400) {
      console.error(`${'='.repeat(w)}\nA status 400 was sent from the server...
        Please ensure that you have specified a valid token!
        Otherwise, please report this to the package maintainers: https://github.com/wzhouwzhou/ytsearcher-cli/issues\n${'='.repeat(w)}\n
      `);
      process.exit(2);
    }
  }
  console.log(util.inspect(new Map(results.currentPage.map((e, i) => [i, e])), false, null, true));
  process.exit(0);
})();
