var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '설다린도 롤체하고싶다고' });
});

module.exports = router;
