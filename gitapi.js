
let git = {
  
  // get repos by language
  'getRepos': async (language, pageNum = 1) => {
    
    let query = 'https://api.github.com/';
    
    query += '/search/repositories' +
             '?q=language:' + language + '&page=' + pageNum + '&sort=stars&order=desc&per_page=100';
   
    // get the query
    const resp = await axios.get(query);
    
    return resp;
  
  },
  
  // get public file content
  'getPublicFile': async (treeLoc, fileName) => {
    
    // map tree location
    let query = 'https://raw.githubusercontent.com';
    const [user, repo, contents] = treeLoc;

    // get repository branch
    let [repoName, branch] = repo.split(':');
  
    query += '/' + user + '/' + repoName +
             '/' + branch +
             '/' + contents + '/' + fileName;
  
    // get the query
    const resp = await axios.get(query, '', true);
    
    return resp;
        
  },

  // get items in tree
  'getItems': async (treeLoc) => {

    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;

    // if navigating in repository
    if (repo != '') {

      // get repository branch
      let [repoName, branch] = repo.split(':');

      if (branch) branch = '?ref='+ branch;
      else branch = '';

      query += '/repos/' + user + '/' + repoName +
               '/contents' + contents +
               branch;

    } else { // else, show all repositories

      query += '/user/repos?visibility=all&sort=updated&per_page=100&page=1';

    }

    // get the query
    const resp = await axios.get(query);

    return resp;

  }

};

