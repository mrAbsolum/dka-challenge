import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from '@material-ui/core/CircularProgress';

export default function ControllableStates() {
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptionsList] = React.useState([{url: "", name: "No results", type:""}]);
  const [open, setOpen] = React.useState(false);
  const loading = open && options.length < 3;


  const getUsers = async function (qry: string) {
    
    if (qry.length < 3) return;

    // Encode special characters to avoid character errors in fetch 
    qry = encodeURIComponent(qry);

    // REST call to get users with given query
    // Results limited to 50 / search
    const responseUsers = await fetch(
      `https://api.github.com/search/users?q=${qry}&per_page=50`
    );
    // REST call to get repositorys with given query
    // Results limited to 50 / search
    const responseRepos = await fetch(
      `https://api.github.com/search/repositories?q=${qry}&per_page=50`
    )
    
    //Give request time handle responses
    await new Promise(r => setTimeout(r, 200));

    //wait for the querys to be returned before continuing
    const users = await responseUsers.json();
    const repos = await responseRepos.json();

    let convertRepos;
    let convertUsers;
    let usersFound = true;
    let reposFound = true;

    // if REST call gives some type of error, give user info
    if (responseRepos.status > 202 || responseUsers.status > 202) {
      if (responseRepos.status === 404) reposFound = false;
      if (responseUsers.status === 404) usersFound = false;
      if (responseUsers.status === 403 || responseUsers.status === 403) {
        window.alert(responseUsers.statusText)
        setOptionsList([{url: "", name: "Error", type:""}]);
        return;
      }
    }

    
    // Trim the objects of returned array of any unnecessary properties
    // Rename the properties for convenience and ease of use
    if (reposFound && repos.items) {
      convertRepos = repos.items.map((item:any) => {
        return {name: item.name, url: item.html_url, type: "Repo: "}
      });
    }
    
  
    // Trim the objects of returned array of any unnecessary properties
    // Rename the properties for convenience and ease of use
    if (usersFound && users.items){
      convertUsers = users.items.map((item:any) => {
        return {name: item.login, url: item.html_url, type:"User: "}
      });
    }

    if (!convertUsers && !convertRepos) return
    if (convertUsers.length === 0 && convertRepos.length === 0) return;

    // Combine both results to one array to be put as options in AutoComplete
    //const combinedList = convertUsers.concat(convertRepos);
    const sortedList = convertUsers.concat(convertRepos).sort(function(a:any, b:any) {
      var nameA = a.name.toUpperCase(); // ignore upper and lowercase
      var nameB = b.name.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    setOptionsList(sortedList);
  };

  const handleChange = (event: object, value: any, reason:any) => {
    if (value && value.url !== ""  && reason === "select-option") {
      window.open(value.url, "_blank");
    }
  };

  return (
    <div>
      <div><h2>{'Search users and repositories from GitHub'}</h2></div>
      <br />
      <Autocomplete
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(event: object, newInputValue: string, reason: string) => {
          getUsers(newInputValue);
          setInputValue(newInputValue);
        }}
        getOptionLabel={(options) => (options) ? options.type + options.name : "Error"}
       // getOptionSelected={(options, value) => options.name === value.name}
        getOptionDisabled={(options) => options.name === "No results" || options.name === "Error"}
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        loading={loading}
        clearOnBlur={false}
        id="controllable-states-demo"
        options={options}
        style={{ height: 300 }}
        renderInput={(params) => (
          <TextField
          {...params}
          label="Search from GitHub"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
        )}
      />
    </div>
  );
}
