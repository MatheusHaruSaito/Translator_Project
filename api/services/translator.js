import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

let key = process.env.KEY;
let endpoint = "https://api.cognitive.microsofttranslator.com/";

// location, also known as region.
// required if you're using a multi-service or regional (not global) resource. It can be found in the Azure portal on the Keys and Endpoint page.
let location = process.env.LOCATION;

export async function translate(message){
let params = new URLSearchParams();
params.append("api-version", "3.0");
params.append("from", "en");
params.append("to", "sw");
params.append("to", "it");

var response = await axios({
    baseURL: endpoint,
    url: '/translate',
    method: 'post',
    headers: {
        'Ocp-Apim-Subscription-Key': key,
         // location required if you're using a multi-service or regional (not global) resource.
        'Ocp-Apim-Subscription-Region': location,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString()
    },
    params: params,
    data: [{
        'text': message
    }],
    responseType: 'json'
}).then(function(response){
    console.log(JSON.stringify(response.data, null, 4));
    return response.data
})
return response
}