
let git = {
  
  // search repos by language
  'searchRepos': async (language, pageNum = 1) => {
    
    let query = 'https://api.github.com';
    
    query += '/search/repositories' +
             '?q=language:' + language + '&page=' + pageNum + '&sort=stars&order=desc&per_page=100';
   
    // get the query
    const resp = await axios.get(query, gitToken);
    
    return resp;
  
  },

  // search repository for files by language
  'searchFiles': async (language, repoName, pageNum = 1) => {

    // map tree location
    let query = 'https://api.github.com';
    
    query += '/search/code?q=language:' + language +
             '+repo:' + repoName + '&page=' + pageNum +
             '&sort=indexed&per_page=100';

    // get the query
    const resp = await axios.get(query, gitToken);

    return resp;

  },
  
  // get public file content
  'getFileContent': async (file) => {
    
    const repoName = file.repository.full_name;
    const branch = file.url.split('?ref=')[1];
    
    let query = 'https://raw.githubusercontent.com';
    
    query += '/' + repoName + '/' + branch + '/' + file.path;
  
    // get the query
    const resp = await axios.get(query, '', true);
    
    return resp;
        
  }

};

