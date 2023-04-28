var express = require('express');
var router = express.Router();
var ER_to_SQL = require('../src/ER_to_SQL.js');
var fs = require('fs');
const pool = require('../middleware/db.js');
const crypto = require('crypto');
require('dotenv').config();



router.get('/dashboard/:uid', async function(req, res, next) {
  var uid = req.params.uid;
  console.log(uid);
  try {
    const result = await pool.query("SELECT json FROM er WHERE id = $1", [uid]);
    var text = result.rows[0].json;
    console.log(text)
    res.render('ER_tool', {text: JSON.stringify(text), host: request.headers.host});
  }
  catch (err) {
    console.error(err.message);
    res.json({"status": "fail"});
  }
});

/* GET home page. */
router.get('/dashboard', function(req, res, next) {
  var json = fs.readFileSync('public/frontend_univ.json', 'utf8');
  var text = JSON.parse(json);
  text = JSON.stringify(text, null, 2);
  res.render('ER_tool', {text: text});
});

router.post('/er_to_sql', function(req, res, next) {
  var er = req.body;
  console.log(er);
  // er = JSON.parse(er);
  var sql = ER_to_SQL(er);
  // console.log(sql);

  res.json({"sql": sql});
});

router.post('/save', async function(req, res, next) {
  var er = req.body.json;
  console.log(er);
  var name = req.body.name;
  console.log(name);
  var description = req.body.description;
  console.log(description);
  // generate a unique id using hash function
  const id = crypto.createHash('md5').update(JSON.stringify(er)+name+description).digest('hex');
  console.log(id);
  try {
    const result = await pool.query("INSERT INTO er (id, name, description, json) VALUES ($1, $2, $3, $4)", [id, name, description, er]);
    res.json({"status": "success"});
  }
  catch (err) {
    console.error(err.message);
    res.json({"status": "fail"});
  }
});

router.get('/', async function(req, res, next) {
  // load all saved ER diagrams
  try {
    const result = await pool.query("SELECT id, name, description FROM er");
    // console.log(result.rows)
    res.render('index', {res: result.rows});
  }
  catch (err) {
    console.error(err.message);
    res.json({"status": "fail"});
  }
});

router.get('/load/:id', async function(req, res, next) {
  // load a specific ER diagram
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT json FROM er WHERE id = $1", [id]);
    res.json(result.rows[0]);
  }
  catch (err) {
    console.error(err.message);
    res.json({"status": "fail"});
  }
});

router.get('/delete/:id', async function(req, res, next) {
  // load a specific ER diagram
  const id = req.params.id;
  console.log(id);
  try {
    const result = await pool.query("DELETE FROM er WHERE id = $1", [id]);
    return res.redirect('/')
  }
  catch (err) {
    console.error(err.message);
    return res.json({"status": "fail"});
  }
});

module.exports = router;
