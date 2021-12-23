const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const { User, Shop, Simg, Post, Pimg, Hashtag, Menu, Basket,Order} = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});
const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'millim',
    key(req, file, cb) {
      cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/img", upload.array("img", 5), (req, res) => {
  console.log("파일 이름 : ", req.files);
  let urlArr = new Array();
  for (let i = 0; i < req.files.length; i++) {
    urlArr.push(req.files[i].location);
    console.log(urlArr[i]);
  }
  let jsonUrl = JSON.stringify(urlArr);
  console.log(jsonUrl);
  res.json(jsonUrl);
});

const upload2 = multer();

router.get('/search', async (req, res, next) => {
  try {
	 	const keyword = req.query.keyword; 
		 const result = await Shop.findAll({ 
			 where:{
				[Op.or]: [
					{
						label: {
							[Op.like]: "%" + keyword + "%"
						}
					},
					{
						road_address: {
							[Op.like]: "%" + keyword + "%"
						}
					}
				]
			 },
			 include: [{
				model: Simg,
			  }]
			 });
	  console.log(result);
	  res.json({result:result});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/searchHash', async (req, res, next) => {
  try {
	 	const keyword = req.query.keyword; 
		 const result = await Shop.findAll({ 
			 where:{
				[Op.or]: [
					{
						label: {
							[Op.like]: "%" + keyword + "%"
						}
					},
					{
						road_address: {
							[Op.like]: "%" + keyword + "%"
						}
					}
				]
			 },
			 include: [{
				model: Simg,
			  }]
			 });
	  const hashtag = await Hashtag.findAll({ where: { title: {[Op.like]: "%" + keyword + "%"} } });
	  let hashs = [];
	  if (hashtag) {
		  for(let i=0;i<hashtag.length;i++){
			 const hash = await hashtag[i].getPosts({});
			  hashs.push({title : hashtag[i].title,length : hash.length});
		  }
	  }
	  console.log(hashs);
	  res.json({result:result,hashs:hashs});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/editShop', upload.array("img", 5), async (req, res, next) => {
  try {
    const shop = await Shop.create({
      label: req.body.label,
	  x:req.body.x,
      y : req.body.y,
	  phone: req.body.phone,
      address: req.body.address,
	  road_address: req.body.road_address,
    });
	  
	const url = req.body.url;
	console.log(url);
	  
	if(!Array.isArray(url)){
		const img = await Simg.create({
		  src : url,
		  ShopId : shop.id
		});
	}else{
		for(var h=0;h<url.length;h++){
		const img = await Simg.create({
		  src : url[h],
		  ShopId : shop.id
		});
	}
	}
	return res.send('<script type="text/javascript">alert("성공적으로 업로드하였습니다.");document.location.href="/edit";</script>');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/write', upload2.array("img", 5), async (req, res, next) => {
  try {
    const post = await Post.create({
      score : req.body.point,
	  content : req.body.review,
	  UserId : req.user.id,
	  ShopId : req.body.ShopId
    });
	  
	const hashtags = req.body.review.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0]));
    }
	  
	const url = req.body.url;
	  
	if(!Array.isArray(url)){
		const img = await Pimg.create({
      	src : url,
		PostId : post.id
		});
	}else{
		for(var h=0;h<url.length;h++){
		const img = await Pimg.create({
      	src : url[h],
		PostId : post.id
		});
	}
	}
	const user = await User.findOne({ where: { id: req.user.id } });
	await user.addInterester(parseInt(post.ShopId, 10));
	return res.send('<script type="text/javascript">alert("성공적으로 업로드하였습니다.");document.location.href="/";</script>');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/like', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
     if (user) {
      await user.addLiker(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/dislike', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.removeLiker(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/interest', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
     if (user) {
      await user.addInterester(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/disinterest', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.removeInterester(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/delete', async (req, res, next) => {
  try {
    Post.destroy({where : { id:req.params.id },force: true});
	Pimg.destroy({where : { id:req.params.id },force: true});
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/around', async (req, res, next) => {
  try {
	 	const x = req.query.x*1 - 0.01;
	  	const xx = req.query.x*1 + 0.01;
	 	const y = req.query.y*1 - 0.01; 
	  	const yy = req.query.y*1 + 0.01; 
	 	console.log(x);
	  	console.log(y);
		 const result = await Shop.findAll({ 
			 where:{
				x : {[Op.lte]: xx, [Op.gte]:x},
				y : {[Op.lte]: yy, [Op.gte]:y},
			 }
			 });
	  console.log(result);
	  res.json({result:result});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/addMenu', upload2.array("img", 5), async (req, res, next) => {
  try {
    const menu = await Menu.create({
      src : req.body.url,
	  label : req.body.label,
	  price : req.body.price,
	  description : req.body.description,
	  ShopId : req.body.shopId
    });
	  const shopId = req.body.shopId;
	 return res.send(`<script type="text/javascript">alert("성공적으로 업로드하였습니다.");document.location.href="/manageShop?id=${shopId}";</script>`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/edit', async (req, res, next) => {
  try {
    const menu =  Menu.update({
	  label : req.body.showLabel,
	  price : req.body.showPrice,
	  description : req.body.showDes,
	 }, {where: {id: req.body.menuId }});
	  const shopId = req.body.shopId;
	 return res.send(`<script type="text/javascript">alert("성공적으로 수정하였습니다.");document.location.href="/manageShop?id=${shopId}";</script>`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/basket', async (req, res, next) => {
  try {
	  const userId = req.query.userId;
	  const shopId = req.query.shopId;
	  const menuId = req.query.menuId;
	  const basket = await Basket.findOne({where:{userId : userId, shopId:shopId, MenuId:menuId}});
	  if(basket){
		  res.json({result:'already'});
	  }else{
		  const result = await Basket.create({
			  userId : userId,
			  shopId : shopId,
			  MenuId : menuId,
			  quant : 1,
			});
		  res.json({result:'ok'});
	  }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/changeQuant', async (req, res, next) => {
  try {
	  const id = req.query.id;
	  const quant = req.query.quant;
	  const basket =  await Basket.update({
						  	quant : quant
						 }, {where: {id: id }});
	  res.json({result:'good'});
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/order', async (req, res, next) => {
  try {
	const label = req.body.label;
	const afterLabel = label.split(',');
	const quant = req.body.quant;
	const afterquant = quant .split(',');
	const total = req.body.total;
	const basketId = req.body.basketId;
	const afterbasketId = basketId .split(',');
	const {shopId, point, level} = req.body;
	let content = '';
	console.log(afterLabel[0]);
	for(let h=0;h<afterLabel.length;h++){
		content += afterLabel[h] + ' *' + afterquant[h] + '\r\n';
	}
	const order = await Order.create({
			  nick : req.user.nick,
			  phone:req.body.phone,
			  total : total,
			  order : content,
			  arrive : req.body.arrive,
			  ShopId : shopId
	});
	for(let i=0;i<afterbasketId.length;i++){
		Basket.destroy({where : { id: afterbasketId[i] },force: true});
	}
	return res.send(`<script type="text/javascript">alert("주문이 완료되었습니다.");document.location.href="/order?id=${shopId}&point=${point}&level=${level}";</script>`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});



module.exports = router;