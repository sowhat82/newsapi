//load libaries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withquery = require('with-query').default

//configure the PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000


const apikey = process.env.apikey || ""
const newsapiurl = 'http://newsapi.org/v2/top-headlines'

// create an instance of express
const app = express()

// configure handlebars
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

// load/mount static resources to be used in the html files
app.use(
    express.static(__dirname + '/static') //can have multiple resource directories
)

// load main page
app.get('/',
(req,resp) => {
    //status 200
    const cart = []
    resp.status(200)
    resp.type('text/html')
    resp.render('index')
})


app.get('/search',
    express.urlencoded({extended: true }),
    async (req,resp) => {
 
        //construct the url with the query parameters
        const url = withquery(
            newsapiurl,
            {
//                q: req.query['searchterm'] + ' ' + req.query['category'] + ' ' + req.query['country'],
                q: req.query['searchterm'],
                country: req.query['country'],
                category: req.query['category'],
 //               apiKey: apikey,
            }
        )
        //fetch returns a promise, to be opened using await. within it is an object with a json function. 
        const result = await fetch(url, {headers:{'X-Api-Key': apikey}}) 
        //result.json returns yet another promise, containing the final json object to be examined.
        const newsapiresult =  await result.json() 

        // the below works to move certain elements from an array to a new array
        const results = newsapiresult.articles.map(              //length of new array will be the same
                    (d)=> {
                        return {title: d.title, url: d.url, img: d.urlToImage, summary: d.description, publishedat: d.publishedAt}          
                    }
        )

        // formatting of the publishedAt field
        for(var i=0; i < results.length; i++) {
            results[i].publishedat = results[i].publishedat.replace('T', ' ');
            results[i].publishedat = results[i].publishedat.replace('Z', ' ');
        }

            var hascontent
                resp.status(200)
                resp.type('text/html')
                resp.render('searchresults', {results, hascontent: !!results.length})
    }
)

// start the server
app.listen(PORT, () => {
    console.info(`Application started on port ${PORT} at ${new Date()}`)
})


