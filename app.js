//. app.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    axiosBase = require( 'axios' ),
    app = express();

require( 'dotenv' ).config();

var authkey = 'AUTHKEY' in process.env && process.env.AUTHKEY ? process.env.AUTHKEY : '';
var base_url = 'BASE_URL' in process.env && process.env.BASE_URL ? process.env.BASE_URL : 'https://api-free.deepl.com';
var axios = axiosBase.create({
  baseURL: base_url,
  headers: {
    'Authorization': 'DeepL-Auth-Key ' + authkey
  },
  responseType: 'json'
});

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

var cors = 'CORS' in process.env ? process.env.CORS : '';
app.all( '/*', function( req, res, next ){
  if( cors ){
    res.setHeader( 'Access-Control-Allow-Origin', cors );
    res.setHeader( 'Access-Control-Allow-Methods', '*' );
    res.setHeader( 'Access-Control-Allow-Headers', '*' );
    res.setHeader( 'Vary', 'Origin' );
  }
  next();
});

app.post( '/api/translate', function( req, res ){
  res.contentType( 'application/json; charset=utf8' );
  if( authkey ){
    var text = req.body.text;
    var target_lang = req.body.target_lang;
    if( text && target_lang ){
      var params = new URLSearchParams();
      params.append( 'text', text );
      params.append( 'target_lang', target_lang );

      var source_lang = req.body.source_lang;
      if( source_lang ){
        params.append( 'source_lang', source_lang );
      }

      axios.post( '/v2/translate', params )
      .then( function( result ){
        res.write( JSON.stringify( { status: true, data: result.data }, null, 2 ) );
        res.end();
      }).catch( function( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, error: err }, null, 2 ) );
        res.end();
      });
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'no text and/or target_lang specified in request body.' }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'no AUTHKEY specified as env variable.' }, null, 2 ) );
    res.end();
  }
});

app.post( '/api/pre_wxa', function( req, res ){
  res.contentType( 'text/plain; charset=utf8' );
  var text = req.body.text;
  
  if( text ){
    var source_lang = req.query.source_lang;
    var target_lang = req.query.target_lang;
    if( source_lang && target_lang ){
      var params = new URLSearchParams();
      params.append( 'text', text );
      params.append( 'target_lang', target_lang );

      if( source_lang ){
        params.append( 'source_lang', source_lang );
      }

      if( authkey ){
        axios.post( '/v2/translate', params )
        .then( function( result ){
          if( result && result.data && result.data.translations && result.data.translations.length > 0 && result.data.translations[0].text ){
            text = result.data.translations[0].text;
          }
          res.write( text );   //. これが msg.payload に入る
          res.end();
        }).catch( function( err ){
          console.log( {err} );
          res.write( text );
          res.end();
        });
      }else{
        console.log( 'no AUTHKEY specified as env variable.' );
        res.write( text );
        res.end();
      }
    }else{
      console.log( 'no source_lang and/or target_lang specified.' );
      res.write( text );
      res.end();
    }
  }else{
    console.log( 'no text specified in payload.' );
    res.write( '' );
    res.end();
  }
});

app.post( '/api/post_wxa', async function( req, res ){
  res.contentType( 'application/json; charset=utf8' );
  var payload = req.body;
  if( typeof payload == 'string' ){ payload = JSON.parse( payload ); }
  if( payload ){
    var source_lang = req.query.source_lang;
    var target_lang = req.query.target_lang;
    var text = ( payload && payload.output && payload.output.generic && payload.output.generic.length > 0 && payload.output.generic[0].text ) ? payload.output.generic[0].text : '';
    if( text && source_lang && target_lang ){
      if( authkey ){
        for( var i = 0; i < payload.output.generic.length; i ++ ){
          text = payload.output.generic[i].text;
          if( text ){
            var params = new URLSearchParams();
            params.append( 'text', text );
            params.append( 'target_lang', target_lang );

            if( source_lang ){
              params.append( 'source_lang', source_lang );
            }
        
            var result = await axios.post( '/v2/translate', params );
            if( typeof result == 'string' ){ result = JSON.parse( result ); }

            //. 元の req.body オブジェクトのフォーマットのまま翻訳結果だけを入れ替えて返す
            if( result && result.data && result.data.translations && result.data.translations.length > 0 && result.data.translations[0].text ){
              payload.output.generic[i].text = result.data.translations[0].text;
            }
          }
        }

        res.write( JSON.stringify( payload, null, 2 ) );
        res.end();
      }else{
        payload.warning = 'no AUTHKEY specified as env variable.';
        res.write( JSON.stringify( payload, null, 2 ) );
        res.end();
      }
    }else{
      payload.warning = 'no text and/or target_lang specified in request body.';
      res.write( JSON.stringify( payload, null, 2 ) );
      res.end();
    }
  }else{
    payload.warning = 'no deepl information found in request body.';
    res.write( JSON.stringify( payload, null, 2 ) );
    res.end();
  }
});

/*
app.get( '/', async function( req, res ){
  res.contentType( 'application/json; charset=utf8' );
  res.write( JSON.stringify( { status: true }, null, 2 ) );
  res.end();
});
*/

var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );

module.exports = app;
