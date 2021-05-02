const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

function getNLUInstance() {
    let api_key = process.env.API_KEY;
    let api_url = process.env.API_URL;
    const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');
    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2020-08-01',
        authenticator: new IamAuthenticator({
            apikey: api_key
        }),
        serviceUrl: api_url
    });
    return naturalLanguageUnderstanding;
}

const app = new express();

app.use(express.static('client'))

const cors_app = require('cors');
app.use(cors_app());

app.get("/", (req, res) => {
    res.render('index.html');
});

app.get("/url/emotion", (req, res) => {
    const params = {
        'url': req.query.url,
        'features': {
            'emotion': {
            }
        }
    };
    return handleEmotionRequest(params, res)
});

app.get("/url/sentiment", (req, res) => {
    const params = {
        'url': req.query.url,
        'features': {
            'sentiment': {
            }
        }
    };
    return handleSentimentRequest(params, res)
});

app.get("/text/emotion", (req, res) => {
    const params = {
        'text': req.query.text,
        'features': {
            'emotion': {
            }
        }
    };
    handleEmotionRequest(params, res)
});

app.get("/text/sentiment", (req, res) => {
    const params = {
        'text': req.query.text,
        'features': {
            'sentiment': {
            }
        }
    };
    return handleSentimentRequest(params,res)
});

function handleSentimentRequest(params, res){
    getNLUInstance().analyze(params)
    .then(analysisResults => {
        if (analysisResults && analysisResults.result 
            && analysisResults.result.sentiment 
            && analysisResults.result.sentiment.document
            && analysisResults.result.sentiment.document.label){
            console.log(JSON.stringify(analysisResults.result))
            return res.send(JSON.stringify(analysisResults.result.sentiment.document.label, null, 2))
        }
        else
            return res.status(500).send("Bad return message");
    })
    .catch(err => {
        console.log('error:', err);
        return res.status(500).send(err.toString());
    });
}

function handleEmotionRequest(params, res){
    getNLUInstance().analyze(params)
    .then(analysisResults => {
        if (analysisResults && analysisResults.result 
            && analysisResults.result.emotion
            && analysisResults.result.emotion.document
            && analysisResults.result.emotion.document.emotion){
            console.log(JSON.stringify(analysisResults.result))
            return res.send(JSON.stringify(analysisResults.result.emotion.document.emotion, null, 2))
        }
        else
            return res.status(500).send("Bad return message");
    })
    .catch(err => {
        console.log('error:', err);
        return res.status(500).send(err.toString());
    });
}

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})

