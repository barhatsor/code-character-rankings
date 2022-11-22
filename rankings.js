
/*
 * Code Character Rankings
 *
 * Usage:
   rankings.apiTokens = ['', 'token1', 'backupToken2', 'backupToken3']; // more is better
   const resp = await rankings.get('js');
 *
 * Options (prefix with 'rankings.'):
 * chars - characters to search for
 * maxCharCount - total number of characters to sample
 * maxRepoCharCount - number of characters to sample in each repo (sample diversity)
 *
 */

let rankings = {

  chars: ['.', ',', '=', '(', ')', '"', '_', '\\', '/', '\'', ';', '-', '{', '}', ':', '&', '|', '[', ']', '!', '+', '<', '>', '?', '*', '`', '%', '#', '@', '$', '~', '^'],
  
  maxCharCount: 10000000, // 10 mil
  
  maxRepoCharCount: 10000000 / 10000, // 1 thousand
  
  charCount: {},
  
  totalCharCount: 0,
  
  repoCount: [],
  
  apiTokens: [], // API tokens
  apiTokenIndex: 0,
  
  get: async (language) => {
    
    rankings.charCount = {};
    
    rankings.chars.forEach(char => {
      rankings.charCount[char] = 0;
    })
    
    rankings.totalCharCount = 0;
    rankings.repoCount = [];
    
    
    if (rankings.apiTokens.length === 0) {
      
      alert('No backup API keys. If rate limit is exceeded, you won\'t be able to finish ranking.');
      
      gitToken = '';
      
    } else {
    
      gitToken = rankings.apiTokens[rankings.apiTokenIndex];
      
    }
    
    
    console.time('Time');
    
    
    let pageNum = 1;
    
    while (rankings.totalCharCount < rankings.maxCharCount) {
    
      await searchRepos(pageNum);
      
      pageNum++;
      
    }
    
    
    
    async function searchRepos(page) {
      
      let repos = await gitRequest(git.searchRepos, [language, page]);
      
      await repos.items.asyncForEach(async (repo) => {
        
        if (rankings.totalCharCount < rankings.maxCharCount) {
          
          rankings.repoCount.push(repo.full_name);
          
          const files = await gitRequest(git.searchFiles, [language, repo.full_name]);
          
          let repoCharCount = 0;
          
          await files.items.asyncForEach(async (file) => {
            
            if ((rankings.totalCharCount < rankings.maxCharCount) ||
                (repoCharCount < rankings.maxRepoCharCount)) {
              
              const content = await gitRequest(git.getFileContent, [file]);
              
              
              const percent = Math.floor(rankings.totalCharCount / rankings.maxCharCount * 100);
              
              console.clear();
              console.log(percent + '% / ' + rankings.totalCharCount);
              console.log('[' + '■'.repeat(percent / 5) + '-'.repeat(20 - percent / 5) + ']');
              console.log(repo.full_name);
              console.log('﹂' + file.name);
              
              
              for (let i = 0; i < content.length; i++) {
                
                if ((rankings.totalCharCount < rankings.maxCharCount) ||
                    (repoCharCount < rankings.maxRepoCharCount)) {
                  
                  const char = content[i];
                  
                  if (rankings.chars.includes(char)) {
                    
                    rankings.charCount[char] += 1;
                    
                  }
    
                  repoCharCount++;              
                  rankings.totalCharCount++;
                  
                } else {
                  
                  return;
                  
                }
                
              }
              
            } else {
              
              return;
              
            }
              
          });
          
        } else {
          
          return;
          
        }
        
      });
      
    }
    
    
    async function gitRequest(request, params) {
      
      let resp = await request(params[0], params[1], params[2]);
      
      if (resp.message && resp.message.startsWith('API rate limit exceeded')) {
        
        // switch to backup API key
        
        rankings.apiTokenIndex++;
        
        // if ran out of backup API keys
        if (!rankings.apiTokens[rankings.apiTokenIndex]) {
          
          const tokens = prompt('API rate limit exceeded. Please input more API keys.');
          
          rankings.apiTokens = tokens.split(',');
          
          rankings.apiTokenIndex = 0;
          
        }
        
        gitToken = rankings.apiTokens[rankings.apiTokenIndex];
        
        // try the request again
        resp = await request(params[0], params[1], params[2]);
        
      }
      
      return resp;
      
    }
    
    
    
    const ranking = Object.entries(rankings.charCount).sort((a, b) => { return b[1] - a[1] });
    
    let rankingNoCount = [];
    
    ranking.forEach(char => {
    
      rankingNoCount.push(char[0]);
    
    });
    
    const resp = {
      ranking: ranking,
      rankingNoCount: rankingNoCount,
      repoCount: rankings.repoCount,
      charCount: rankings.charCount,
      totalCharCount: rankings.totalCharCount
    };
    
    
    console.clear();
        
    console.log(`
Code Character Ranking

----------------------------
Language: `+ language +`
Sample size: `+ rankings.totalCharCount +`
Sample diversity: `+ rankings.repoCount.length +`
----------------------------

`+ JSON.stringify(ranking) + `

`+ JSON.stringify(rankingNoCount) + `

`);

    console.timeEnd('Time');
    
    console.log('Stats:', resp);

    
    return resp;
    
  }
  
};
















let gitToken = '';


Array.prototype.asyncForEach = async function(callback) {
  
  const array = this;
  
  for (let index = 0; index < array.length; index++) {
    
    await callback(array[index], index, array);
    
  }
  
};


let axios = {
  'get': (url, token, noParse) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if (this.readyState == 4 && String(this.status).startsWith('2')) {
            try {
              if (!noParse) {
                resolve(JSON.parse(this.responseText));
              } else {
                resolve(this.responseText);
              }
            } catch (e) {
              resolve();
            }
          } else if (this.responseText) {
            try {
              if (!noParse) {
                resolve(JSON.parse(this.responseText));
              } else {
                resolve(this.responseText);
              }
            } catch (e) {}
          }
        };
        xmlhttp.onerror = function() {
          if (this.responseText) {
            try {
              if (!noParse) {
                resolve(JSON.parse(this.responseText));
              } else {
                resolve(this.responseText);
              }
            } catch (e) {}
          }
        };
        
        xmlhttp.open('GET', url, true);
        xmlhttp.timeout = 4000;
        if (token) xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send();
      } catch (e) {
        reject(e)
      }
    });
  }
};

