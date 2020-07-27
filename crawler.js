var Crawler = require("crawler");
var dbutils = require("./db-utils");
let psl = require('psl');
const listaenlaces = [];
const cheerio = require('cheerio');
const WEBSITE = 'https://ronaldao.com'
function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

var c = new Crawler({
    maxConnections :1,
    rotateUA: true,
    jQuery: {
        name: 'cheerio',
        options: {
            normalizeWhitespace: true,
            xmlMode: true
        }
    },
    //rateLimit: 3000,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            //console.log("body===>",res.$.html())
            var $ = res.$;
            console.log($)
            const list = $('body')
                  .find('a')
                  .toArray()
                  .map(async element => {
                    const href = $(element).attr('href');
                    const texto = $(element).text().trim();
                    if(!listaenlaces.includes(href)){
                        listaenlaces.push(href)
                        if (href && texto && href.length >4 && texto.length >2 && !href.includes('#')) {
                            const website = psl.get(extractHostname(WEBSITE))
                            //verifica si existe el registro en la bd y si no existe, lo guarda
                            const guardo = await dbutils.guardarEnlace(href, texto, website)
                            if( guardo === true){
                                console.log("Saved ✅✅")
                                c.queue(href);
                            }else{
                                console.log("== ❌ NO SE GUARDO ❌ ==")
                            }
                    }else{
                        console.log("== repetido ☑️ ==")
                    }
                    }})
        }
        done();
    }
});

// Queue just one URL, with default callback
c.queue(WEBSITE);

