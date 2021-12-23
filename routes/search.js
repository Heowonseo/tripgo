const express = require('express');
const axios = require('axios');


const router = express.Router();

router.get('/search', async (req, res, next) => {
  try {
		
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;