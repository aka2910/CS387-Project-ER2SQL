var express = require('express');
var router = express.Router();
var ER_to_SQL = require('../src/ER_to_SQL.js');
var fs = require('fs');

/* GET home page. */
router.get('/', async function(req, res, next) {
  // read text from frontend_univ.json
  var json = await fs.readFileSync('public/frontend_univ.json', 'utf8');
  var text = JSON.parse(json);
  text = JSON.stringify(text, null, 2);
  res.render('Er_tool', { title: 'Express' , text: text});
});

router.post('/er_to_sql', function(req, res, next) {
  var er = req.body;
  console.log(er);
  // er = JSON.parse(er);
  var sql = ER_to_SQL(er);
  // console.log(sql);

  res.json({
    
    "sql": sql});
});


module.exports = router;
