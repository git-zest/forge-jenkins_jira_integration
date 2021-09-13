import ForgeUI, { render, Fragment, TextField, Text, Form, Button, ButtonSet, IssuePanel, Select, Option ,useEffect, useState, useProductContext } from '@forge/ui';
import { storage, properties } from '@forge/api';
import api from "@forge/api";

import { route } from '@forge/api';

//import https from "https";
import { fetch } from '@forge/api';
//mport { Agent } from 'https';
import https from 'https';
import axios from 'axios';



async function doGet(apiPath) {
  const response = await api.asApp().requestJira(apiPath);
  if (!response.ok) {
    const message = `Error invoking ${apiPath}: ${response.status} ${await response.text()}`;
    console.error(message);
    throw new Error(message);
  }
  const responseBody = await response.json();
  if (process.env.DEBUG_LOGGING) {
    console.debug(`GET ${apiPath}: ${JSON.stringify(responseBody)}`);
  }
  return responseBody;
}



const App =  () => {
  //const { platformContext: { issueKey } } = useProductContext();
  const jiraissueid = useProductContext().platformContext.issueKey;
  const jiraprojectid = useProductContext().platformContext.projectKey;
  const jiraissueType = useProductContext().platformContext.issueType
  const [formState, setFormState] = useState(undefined);
  const [input, setJenkinsURL] = useState('');
  const [input1, setjenkinsUname] = useState('');
  const [input2, setjenkinsPwd] = useState('');
  const [isFetched, setFetchedData] = useState(false);
  const [isjenkinsvl, setjenkinsData] = useState('');
  const [isjenkinsjob, setjenkinsjob] = useState('');
  const [isjenkinsjobfound, setjenkinsfound] = useState(false);
  const [isjiraTrans, setjiraTrans] = useState(JSON.stringify( storage.get(jiraissueid+'-Jiratransition')));
  //console.log(isjenkinsvl);
  const [jenkinsvalue, setJenkinsvalue] = useState(null);
  const [setup, setsetupvalue] = useState(false);
  const [options, setOptions] = useState([]);
  const [optionsjira, setjiraOptions] = useState([]);



  async function addjirastatus(issueId, jenkinsURL, jenkinsUsername, jenkinspassword) {
    console.log(jenkinsUsername);
    console.log(jenkinspassword);
    const requestUrl = `/rest/api/2/issue/${issueId}/editmeta`;
     const body = {
           "fields": {
               "customfield_10038": jenkinsURL,
               "customfield_10039": jenkinsUsername,
               "customfield_10040": jenkinspassword
           }
        };


     let response1 = await api.asApp().requestJira( `/rest/api/3/issue/${issueId}`, {
         method: "PUT",
         headers: {
             "Content-Type": "application/json"
         },
         body: JSON.stringify(body)
     });
     //console.log(response1);
     return response1.json();
 }



 async function addjirajobstatus(issueId, jobname, jiratransition) {
   console.log(jobname);
   console.log(jiratransition);
   const requestUrl = `/rest/api/2/issue/${issueId}/editmeta`;
    const body = {
          "fields": {
              "customfield_10041": jobname,
              "customfield_10042": jiratransition
          }
       };


    let response1 = await api.asApp().requestJira( `/rest/api/3/issue/${issueId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    //console.log(response1);
    return response1.json();
}

  //console.log(useProductContext());
  //console.log(jiraissueid+'-jenkinsjob');
  useEffect(async() => {
    //await validate();
    //await storage.set(jiraissueid+'-jenkinsvalue')
     setjenkinsData(JSON.stringify(await storage.get(jiraissueid+'-jenkinsvalue')));
     //var value_jenkins = await storage.get(jiraissueid+'-jenkinsset')

    if(!isFetched){
      setJenkinsURL(isjenkinsvl['URL']);
      setjenkinsUname(isjenkinsvl['Username']);
      setjenkinsPwd(isjenkinsvl['Password']);
      setFormState(JSON.stringify(isjenkinsvl));

      console.log('changed valued'+JSON.stringify(isjenkinsvl));
      console.log('changed valueis '+ JSON.stringify(await storage.get(jiraissueid+'-jenkinsvalue')));
      //console.log(typeof(isjenkinsvl['URL']));
      var urlvl =await storage.get(jiraissueid+'-jenkinsvalue');
      if(urlvl == ''){
        console.log('undefined changed');
      }
      else if (typeof(urlvl) == 'undefined'){
        console.log('undefined changed');
      }
      else{
        console.log('starting ');
        console.log(urlvl.URL);
        var url_value = urlvl.URL + '/api/json?tree=jobs[name,color,number]';
        var config = {
          method: 'get',
          url: url_value,
          headers: {
            'Authorization': 'Basic RGV2b3BzOlRlc3QxMjM=',
            'Content-Type': 'text/plain',
          }
        };

        await axios(config)
        .then(async function (response) {
          var jenkinsoption = [];
          //int i=0;
          var jenkinsvar='';
          if(response.status == '200'){
            console.log(JSON.stringify(response.data.jobs));
            setjenkinsfound(true);
            var jobsdetail = response.data.jobs;
            //console.log();
            for (var eachjobs in jobsdetail){
              jenkinsvar={label: jobsdetail[eachjobs].name, name: jobsdetail[eachjobs].name};
              jenkinsoption.push(jenkinsvar);
            }
            console.log(jenkinsoption);
            setOptions(jenkinsoption);

            //console.log(jiraissueid+'-jenkinsjob');
            await storage.set(jiraissueid+'-jenkinsjob', jenkinsoption);
            //console.log(storage.get(jiraissueid+'-jenkinsjob'))
            setjenkinsfound(jenkinsoption);

            //await properties.onJiraIssue(jiraissueid).set('jenkinsvalue', isjenkinsvl);
            //console.log(await properties.onJiraIssue(jiraissueid).get('jenkinsvalue'));
          try{
            const response1 = await addjirastatus(jiraissueid, urlvl.URL, urlvl.Username, urlvl.Password);
          }catch(err){

          }

          }
          if(response.status != '200'){
            setjenkinsfound(false);
          }
        })
        .catch(function (error) {
          setjenkinsfound(false);
          console.log(error);
        });


        const issueResponse = await api.asApp().requestJira(`/rest/api/2/project/${jiraprojectid}/statuses`);
        //await checkResponse('Jira API', issueResponse);
        const statuses  = (await issueResponse.json());
        //console.log(statuses);
        var jiraoption = [];
        for (var status in statuses){
          //console.log(statuses[status]);
          if(jiraissueType==statuses[status].name){
            var newobjStatus = statuses[status].statuses;
            for(var statusobj in newobjStatus ){
              var jiravar={label: newobjStatus[statusobj].name, name: newobjStatus[statusobj].name};
              jiraoption.push(jiravar);
            }
            setjiraOptions(jiraoption);
          }
        }
      }
      setFetchedData(true);
      }
      
  }, []);







  async function onSubmit (formData) {
    //console.log(jiraissueid);
    //console.log(formData);
    await storage.set(jiraissueid+'-jenkinsvalue', formData);
    console.log(JSON.stringify(await storage.get(jiraissueid+'-jenkinsvalue')));
    console.log(formData.URL);
    setFetchedData(false);
    var url_value = formData.URL + '/api/json?tree=jobs[name,color,number]';
    var btoa = require('btoa');
    var bin = formData.Username+":"+formData.Password;
    var b64 = btoa(bin);

    var config = {
      method: 'get',
      url: url_value,
      headers: {
        'Authorization': 'Basic '+ b64,
        'Content-Type': 'text/plain',
      }
    };

    await axios(config)
    .then(async function (response) {
      var jenkinsoption = [];
      //int i=0;
      var jenkinsvar='';
      if(response.status == '200'){
        //console.log(JSON.stringify(response.data.jobs));
        setjenkinsfound(true);
        var jobsdetail = response.data.jobs;
        //console.log();
        for (var eachjobs in jobsdetail){
          jenkinsvar={label: jobsdetail[eachjobs].name, name: jobsdetail[eachjobs].name};
          jenkinsoption.push(jenkinsvar);
        }
        //console.log(jenkinsoption);  try{
        setOptions(jenkinsoption);
        await storage.set(jiraissueid+'-jenkinsjob', jenkinsoption);
        setjenkinsfound(jenkinsoption);
          try{
        const response1 = await addjirastatus(jiraissueid, formData.URL, formData.Username, formData.Password);
      }catch(err){

        }
        //const response = await addjirastatus(jiraissueid, jenkinsvalue.URL);
      }
      if(response.status != '200'){
        setjenkinsfound(false);
      }
    })
    .catch(function (error) {
      setjenkinsfound(false);
    });

    const issueResponse = await api.asApp().requestJira(`/rest/api/2/project/${jiraprojectid}/statuses`);
    //await checkResponse('Jira API', issueResponse);
    const statuses  = (await issueResponse.json());
    //console.log(statuses);
    var jiraoption = [];
    for (var status in statuses){
      //console.log(statuses[status]);
      if(jiraissueType==statuses[status].name){
        var newobjStatus = statuses[status].statuses;
        for(var statusobj in newobjStatus ){
          var jiravar={label: newobjStatus[statusobj].name, name: newobjStatus[statusobj].name};
          jiraoption.push(jiravar);
        }
        setjiraOptions(jiraoption);
      }
    }


  }


async function onBuildSubmit (formData) {
  console.log(formData);
  await storage.set(jiraissueid+'-jenkinsjobset', formData);
  await storage.set(jiraissueid+'-jenkinsset', true);
  try{
  const response1 = await addjirajobstatus(jiraissueid, formData.jenkinsdata, formData.jirastatus);
  }catch(err){

  }
}




  return (
    <Fragment>
    {!isjenkinsjobfound ? (
    <Fragment>
    <Form id='formElem' onSubmit={onSubmit}>
      <TextField name="URL" label="URL" value={input}
       />
      <TextField name="Username" label="Username" value={input1}
      />
      <TextField name="Password" label="Password" value={input2}
      />
    </Form>
    </Fragment>
  ) : (
    <Fragment>
    <Form id='formBuild' onSubmit={async (formData) => {
      console.log(formData);
      await storage.set(jiraissueid+'-jenkinsjobset', formData);
      await storage.set(jiraissueid+'-jenkinsset', true);
      try{
      const response1 = await addjirajobstatus(jiraissueid, formData.jenkinsdata, formData.jirastatus);
      }catch(err){

      }
    }}>

      <Select label="Jenkins Job" name="jenkinsdata">
            {options.map(option => {return(<Option  label={option.name} value={option.label} />)})}
      </Select>
      <Select label="Jira Status" name="jirastatus">
            {optionsjira.map(optionjira => {return(<Option  label={optionjira.name} value={optionjira.label} />)})}
      </Select>
    </Form>
    </Fragment>
    )}
    </Fragment>

  );
};







export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>
);
