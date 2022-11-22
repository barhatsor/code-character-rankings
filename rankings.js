
// rankings.get('js')

let rankings = {

  chars: ['.', ',', '=', '(', ')', '"', '_', '\\', '/', '\'', ';', '-', '{', '}', ':', '&', '|', '[', ']', '!', '+', '<', '>', '?', '*', '`', '%', '#', '@', '$', '~', '^'],
  
  maxCharCount: 1000000, // 1 mil
  
  charCount: {},
  
  totalCharCount: 0,
  
  repoCount: [],
  
  get: async (language) => {
    
    rankings.charCount = {};
    
    rankings.chars.forEach(char => {
      rankings.charCount[char] = 0;
    })
    
    rankings.totalCharCount = 0;
    rankings.repoCount = [];
    
    
    const repos = await git.searchRepos(language);
    
    await repos.items.asyncForEach(async (repo) => {
      
      if (rankings.totalCharCount < rankings.maxCharCount) {
        
        rankings.repoCount.push(repo.full_name);
        
        const files = await git.searchFiles(language, repo.full_name);
        
        await files.items.asyncForEach(async (file) => {
          
          const content = await git.getFileContent(file);
          
          
          const percent = Math.floor(rankings.totalCharCount / rankings.maxCharCount * 100);
          
          console.clear();
          console.log(percent + '%');
          console.log('[' + '■'.repeat(percent / 5) + '-'.repeat((100 - percent) / 5) + ']');
          console.log(repo.full_name);
          console.log('﹂' + file.name);
          
          
          for (let i = 0; i < content.length; i++) {
            
            if (rankings.totalCharCount < rankings.maxCharCount) {
              
              const char = content[i];
              
              if (rankings.chars.includes(char)) {
                
                rankings.charCount[char] += 1;
                
              }
              
              rankings.totalCharCount++;
              
            } else {
              
              return;
              
            }
            
          }
          
        });
        
      }
      
    });
    
    const ranking = Object.entries(rankings.charCount).sort((a, b) => { return b[1] - a[1] });
    
    console.log(rankings.totalCharCount + ' chars\n\n' + JSON.stringify(ranking) + '\n\nrepos:\n\n' +  JSON.stringify(rankings.repoCount))    
    
    return {
      ranking: ranking,
      repoCount: rankings.repoCount,
      charCount: rankings.charCount,
      totalCharCount: rankings.totalCharCount
    };
    
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
        xmlhttp.send();
      } catch (e) {
        reject(e)
      }
    });
  }
};

