const express = require('express');
const { Op } = require('sequelize');
const axios = require('axios');
const passport = require('passport');
const moment = require('moment');
const { User, Shop, Simg, Post, Pimg,Hashtag,Menu,Basket,Order,Hapdong, Yacol, Jumal } = require('../models');
const jwt = require('jsonwebtoken');
const viewObj = new Object();


const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
  next();
});

//nav
router.get('/', async (req, res, next) => {
  try {/*
	  const token = req.cookies.MyCookie;
	  if(token){
		 return res.render('jbMain');
	  }else{
		 return res.send('<script type="text/javascript">alert("정보를 입력해주세요.");document.location.href="/information";</script>');
	  }
	  */
	  
		var post = await Post.findAll({ 
			order : [['id', 'DESC']],
			 include: [{
				model: Pimg,
			  },{
				model: User,  
			  },{
				model: Shop,
			  },{
				model: User,
				as: 'Liked',
				attributes: ['id']
			  }]
			 });
	const ListAry = [];
	for(var j=0;j<post.length;j++){
		const likeList = post[j] ? post[j].Liked.map(f => f.id) : [];
		post[j].Liker = likeList;
	}
	return res.render('main', {post:post,ListAry:ListAry});
	
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/around', async (req, res, next) => {
  try {
	return res.render('around');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/write', async (req, res, next) => {
  try {
	return res.render('write');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/wish', async (req, res, next) => {
  try {
	const exUser = await User.findOne({ where : { id : req.user.id},
									   include: [{
											model: Shop,
											as: 'Interester',
										   	include: [{
													model: Simg
												}, {
													model:Post,
												}],
										  	},
												]});
	for(var j=0;j<exUser.Interester.length;j++){
		var idList = [];
		for(var h=0;h<exUser.Interester[j].Posts.length;h++){
			idList.push(exUser.Interester[j].Posts[h].UserId);
		}
		exUser.Interester[j].idList = idList;
	}
	return res.render('like', {exUser : exUser});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//header
router.get('/search', async (req, res, next) => {
  try {
	const post = await Post.findAll({
									order : [['id', 'DESC']],
								   	include: [{
										model: Pimg,
										limit:1
									  }]});
	const shop = await Shop.findAll({limit:10,include: [{
						model: Simg,
					}]});
	console.log(shop);
	return res.render('search',{ post :post, shop:shop});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/user', async (req, res, next) => {
  try {
	 const id = req.query.i;
	 const exUser = await User.findOne({ where : { id : id},
									   include: [{
											model: User,
											attributes: ['id', 'nick'],
											as: 'Followers',
										  }, {
											model: User,
											attributes: ['id', 'nick'],
											as: 'Followings',
										  }]});
	 const post = await Post.findAll({ where : {UserId : id },
							   order : [['id', 'DESC']],
							   include: [{
									model: Pimg,
								    limit : 1
								  }]});
	  console.log(post);
	return res.render('userPage',{post: post, exUser: exUser });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/shop', async (req, res, next) => {
  try {
	const id = req.query.i;
	const shop = await Shop.findOne({
					where : { id : id},
					include: [{
						model: Simg,
					},{
						model: Post,
					  },{
						model: User,
						as: 'Interested',
					  }]
				});
	 var shoppenId = [];
	 var point =0;
	 if(shop.Posts){
		 for(var i=shop.Posts.length-1;i>=0;i--){
			 const post = await Post.findOne({ where : {id : shop.Posts[i].id },
								   include: [{
										model: Pimg,
										limit:1
									  }],});
			 point += post.score*1;
			 shoppenId.push(post);
		 }
		  point = point/shop.Posts.length;
	 }else{
		 point =0;
	 }
	  
	  if(!point){
		  point = {point : 0, level : -1};
	 }else if(point >= 0 && point < 1){
		  point = {point : point, level : 0};
	  }else if(point >= 1 && point <2){
		   point = {point : point, level : 1};
	  }else if(point >= 2 && point <3){
		   point = {point : point, level : 2};
	  }else if(point >= 3 && point <4){
		   point = {point : point, level : 3};
	  }else if(point >= 4 && point <5){
		   point = {point : point, level : 4};
	  }else{
		   point = {point : point, level : 5};
	  }
	  console.log(point);
	const interestList = shop ? shop.Interested.map(f => f.id) : [];
	return res.render('shop',{shop:shop, shoppenId : shoppenId, interestList:interestList,point:point});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/post', async (req, res, next) => {
  try {
	const id = req.query.i; 
	const post = await Post.findOne({
			order : [['id', 'DESC']],
			where : {id : id},
			 include: [{
				model: Pimg,
			  },{
				model: User,  
			  },{
				model: Shop,
			  },{
				model: User,
				as: 'Liked',
			  }]
			 });
	console.log(post);
	const likeList = post ? post.Liked.map(f => f.id) : [];
	return res.render('post',{ post : post, likeList : likeList});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/edit', async (req, res, next) => {
  try {
	return res.render('editShop');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/following', async (req, res, next) => {
  try {
	 const id = req.query.i;
	 const exUser = await User.findOne({ where : { id : id},
									   include: [{
											model: User,
											attributes: ['id', 'nick','profileImg'],
											as: 'Followers',
										  }, {
											model: User,
											attributes: ['id', 'nick','profileImg'],
											as: 'Followings',
										  }]});
	res.render('following',{exUser : exUser});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/follower', async (req, res, next) => {
  try {
		const id = req.query.i;
		const exUser = await User.findOne({ where : { id : id},
										   include: [{
												model: User,
												attributes: ['id', 'nick','profileImg'],
												as: 'Followers',
											  }, {
												model: User,
												attributes: ['id', 'nick','profileImg'],
												as: 'Followings',
											  }]});
		res.render('follower',{exUser : exUser});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/hash', async (req, res, next) => {
  try {
		const title = req.query.title;
		const hashtag = await Hashtag.findOne({
								where: {
									title: title 
								}, include: [{
									model:Post,
									include: [{
										model: Pimg,
										limit : 1
									  }]
								}]
							});
	    console.log(hashtag);
		res.render('hashtag',{hashtag : hashtag});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/order', async (req, res, next) => {
  try {
	const id = req.query.id;
	const point = req.query.point;
	const level = req.query.level;
	const shop = await Shop.findOne({
					where : { id : id},
					include: [{
						model: Simg,
					},{
						model: Menu,
					}]
	});
	const baskets = await Basket.findAll({
		where : {shopId : id, userId : req.user.id},
		include: [{
				model: Menu,
				}]
	});
	console.log(baskets);
	res.render('order',{shop:shop,point:point,level:level, baskets:baskets});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/manageShop', async (req, res, next) => {
  try {
	const id = req.query.id;
	const shop = await Shop.findOne({
					where : { id : id},
					include: [{
						model: Simg,
					},{
						model: Menu,
					}]
	});
	const orders = await Order.findAll({where : {ShopId : id}});
	res.render('manageShop',{shop:shop,order : orders});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/gtw', async (req, res, next) => {
  try {
	  const today = moment().add(1, 'd');
	  const date = today.format('YYYY-MM-DD');
	  const gtw1 = await Hapdong.findOne({
		  where : {
			  when : '출근',
			  schedule : '거여',
			  date:date
		  }
	  });
	  const gtw2 = await Hapdong.findOne({
		  where : {
			  when : '출근',
			  schedule : '양재',
			  date:date
		  }
	  });
	  return res.render('gtw',{date,gtw1,gtw2});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/off', async (req, res, next) => {
  try {
	  const today = moment().add(1, 'd');
	  const date = today.format('YYYY-MM-DD');
	  const off1 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '위례 1호차',
			  date:date
		  }
	  });
	  const off2 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '위례 2호차',
			  date:date
		  }
	  });
	  const off3 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '위례 3호차',
			  date:date
		  }
	  });
	  const off4 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '위례 4호차',
			  date:date
		  }
	  });
	  const off5 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '안양 1호차',
			  date:date
		  }
	  });
	  const off6 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '안양 2호차',
			  date:date
		  }
	  });
	  const off7 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '안양 3호차',
			  date:date
		  }
	  });
	  const off8 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '서빙고 1호차',
			  date:date
		  }
	  });
	  const off9 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '서빙고 2호차',
			  date:date
		  }
	  });
	  const off10 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '양재 1호차',
			  date:date
		  }
	  });
	  const off11 = await Hapdong.findOne({
		  where : {
			  when : '퇴근',
			  schedule : '양재 2호차',
			  date:date
		  }
	  });
	  return res.render('off',{date,off1,off2,off3,off4,off5,off6,off7,off8,off9,off10,off11});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/yacol', async (req, res, next) => {
  try {
	  const token = req.cookies.MyCookie;
	  if(!token){
		  return res.send('<script type="text/javascript">alert("정보를 입력해주세요.");document.location.href="/information";</script>');
	  }
	  var result = 'f';
	  var dataList = [];
	  const tokeny = req.cookies.YacolCookie;
	  if(tokeny){
		  result = 't';
		  const decode = jwt.verify(tokeny, process.env.JWT_SECRET);
		  const daty = decode.date;
		  const desti = decode.desti;
		  const kinds = decode.kinds;
		  const numbers = decode.numbers;
		  dataList.push({date:daty});
		  dataList.push({desti:desti});
		  dataList.push({kinds:kinds});
		  dataList.push({numbers:numbers});
	  }
	  const decoded = jwt.verify(token, process.env.JWT_SECRET);
	  const level = decoded.level;
	  const driver = decoded.driver;
	  const today = moment();
	  const date = today.format('YYYY-MM-DD');
	  const month = today.format('MM');
	  const day = today.day();
	  return res.render('yacol',{date,month,driver,level,result,dataList, day});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/hapdong', async (req, res, next) => {
  try {
	  const token = req.cookies.MyCookie;
	  if(!token){
		  return res.send('<script type="text/javascript">alert("정보를 입력해주세요.");document.location.href="/information";</script>');
	  }
	  const decoded = jwt.verify(token, process.env.JWT_SECRET);
	  const level = decoded.level;
	  const driver = decoded.driver;
	  const today = moment().add(1, 'd');
	  const date = today.format('YYYY-MM-DD');
	  return res.render('hapdong',{date,driver,level});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/information', async (req, res, next) => {
  try {
	  return res.render('userInform');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/check', async (req, res, next) => {
  try {
	  const today = moment();
	  const month = today.format('MM');
	  const yacolResult = await Yacol.findAll({ where : { month : month }});
	  const jumalResult = await Jumal.findAll({ where : { month : month }});
	  return res.render('check',{yacol : yacolResult, jumal : jumalResult});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;