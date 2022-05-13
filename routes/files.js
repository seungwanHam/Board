const express  = require('express');
const router = express.Router();
const File = require('../models/File');

router.get('/:serverFileName/:originalFileName', function(req, res){
  File.findOne({serverFileName:req.params.serverFileName, originalFileName:req.params.originalFileName}, function(err, file){
    if(err) return res.json(err);

    var stream = file.getFileStream();
    if(stream){
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream; charset=utf-8',
        'Content-Disposition': 'attachment; filename=' + encodeURI(file.originalFileName)
      });
      stream.pipe(res);
    }
    else {
      res.statusCode = 404;
      res.end();
    }
  });
});

module.exports = router;