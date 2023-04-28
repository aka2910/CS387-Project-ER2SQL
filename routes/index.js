var express = require('express');
var router = express.Router();
var ER_to_SQL = require('../src/ER_to_SQL.js');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('ER_tool', { title: 'Express' });
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
