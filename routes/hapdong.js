const express = require('express');
const { Op } = require('sequelize');
const { Hapdong, Yacol,Jumal } = require('../models');
const nodemailer = require('nodemailer');
const send_go_message = require('./sens');
const send_back_message = require('./sens2');
const jwt = require('jsonwebtoken');


const router = express.Router();

router.post('/apply', async (req, res, next) => {
  try {
	 const {when, schedule, applicant, driver,date} = req.body;
	  const checkApply = await Hapdong.findOne({
		  where: {
			  when : when,
			  schedule : schedule,
			  date : date
		  }
	  });
	  if(checkApply){
		  return res.send('<script type="text/javascript">alert("이미 합동 신청자가 있는 운행입니다.");document.location.href="/hapdong";</script>');
	  }
	  const hap = await Hapdong.create({
		  when : when,
		  schedule : schedule,
		  applicant : applicant,
		  driver : driver,
		  date:date
	  });
	  const gtw = await Hapdong.findAll({
			  where: {
				  when : '출근',
				  date:date
			  }
		  });
	  var gtwContents = date + '<br>출근 합동 신청<br>';
	  for(let i=0;i<gtw.length;i++){
		  gtwContents += `${i}. ${gtw[i].schedule} --> 선탑:${gtw[i].applicant} / 운전:${gtw[i].driver}`  + '<br>';
	  }
	  const off = await Hapdong.findAll({
			  where: {
				  when : '퇴근',
				  date:date
			  }
		  });
	  var offContents = '<br>퇴근 합동 신청<br>';
	  for(let i=0;i<off.length;i++){
		 offContents += `${i}. ${off[i].schedule} --> 선탑:${off[i].applicant} / 운전:${off[i].driver}`  + '<br>';
	  }
	  const transporter = nodemailer.createTransport({
			service: 'naver',
			auth: {
				user: process.env.NAVER_ID,
				pass: process.env.NAVER_PASS
			},tls: {
				 rejectUnauthorized: false
			 }
		});
	  const mailOptions = {
			from:{
				name: '합동',
				address: process.env.NAVER_ID
			}, // sender address
			to:{
				address: 'heowonseo@naver.com'
			}, // list of receivers
			subject: "합동 신청", // Subject line
			html: gtwContents + offContents
		  		
		};
		transporter.sendMail(mailOptions, (error, info) => {
			if(error){
				console.log(error,info);
			}transporter.close();});
	  return res.send('<script type="text/javascript">alert("성공적으로 신청되었습니다.");document.location.href="/hapdong";</script>');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/:datee/:wheny/:schedulee/cancle', async (req, res, next) => {
  try {
	  const date = req.params.datee;
	  const hap = await Hapdong.findOne({where:{
										 date : req.params.datee,
		  							     when : req.params.wheny,
		  								 schedule : req.params.schedulee
									  }});
	  if(hap){
		  Hapdong.destroy({where : { id: hap.id }});
		  const gtw = await Hapdong.findAll({
				  where: {
					  when : '출근',
					  date:date
				  }
			  });
		  var gtwContents = date + '<br>출근 합동 신청<br>';
		  for(let i=0;i<gtw.length;i++){
			  gtwContents += `${i}. ${gtw[i].schedule} --> 선탑:${gtw[i].applicant} / 운전:${gtw[i].driver}`  + '<br>';
		  }
		  const off = await Hapdong.findAll({
				  where: {
					  when : '퇴근',
					  date:date
				  }
			  });
		  var offContents = '<br>퇴근 합동 신청<br>';
		  for(let i=0;i<off.length;i++){
			 offContents += `${i}. ${off[i].schedule} --> 선탑:${off[i].applicant} / 운전:${off[i].driver}` + '<br>';
		  }
		  const transporter = nodemailer.createTransport({
				service: 'naver',
				auth: {
					user: process.env.NAVER_ID,
					pass: process.env.NAVER_PASS
				},tls: {
					 rejectUnauthorized: false
				 }
			});
		  const mailOptions = {
				from:{
					name: '합동',
					address: process.env.NAVER_ID
				}, // sender address
				to:{
					address: 'heowonseo@naver.com'
				}, // list of receivers
				subject: "합동 신청", // Subject line
				html: gtwContents + offContents

			};
			transporter.sendMail(mailOptions, (error, info) => {
				if(error){
					console.log(error,info);
				}transporter.close();});
		  return res.json({result:'t'});
	  }else{
		    return res.json({result:'f'});
	  }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/yacol', async (req, res, next) => {
  try {
	 const {date, month, driver,desti,kinds,numbers,day} = req.body;
	 var t = 1;
	 if(day == 0 || day == 6){
		const jumal = await Jumal.findOne({
			  where: {
				  driver : driver,
				  month:month
					 }
		  });
		  if(jumal){
			  var countt = jumal.count + 1;
			  t = countt;
			  await Jumal.update({
				  count : countt,
				 }, {where: {
						 driver : driver,
						 month:month 
				 }
					});
		  }else{
			  await Jumal.create({
					driver:driver,
					month:month,
					count : 1
				});
		  }
	 }else{
		 const yac = await Yacol.findOne({
			  where: {
				  driver : driver,
				  month:month
					 }
		  });
		  if(yac){
			  var countt = yac.count + 1;
			  t = countt;
			  await Yacol.update({
				  count : countt,
				 }, {where: {
						 driver : driver,
						 month:month 
				 }
					});
		  }else{
			  await Yacol.create({
					driver:driver,
					month:month,
					count : 1
				});
		  }
	 }
	  await send_go_message(driver, desti,kinds,numbers);
	  const tokeny = jwt.sign(
		  	 {date, desti,kinds,numbers},
			 process.env.JWT_SECRET
		);
	  const expiryDate = new Date( Date.now() + 60 * 60 * 1000 * 24);
	  res.cookie('YacolCookie',tokeny, { httpOnly: true,expires: expiryDate});
	  if(day == 0 || day == 6){
		  return res.send(`<script type="text/javascript">alert("조심히 다녀오십시오. ${driver}님은 ${month}월 ${t}번의 주말콜택시 운행이 있었습니다.");document.location.href="/yacol";</script>`);
	  }else{
		  return res.send(`<script type="text/javascript">alert("조심히 다녀오십시오. ${driver}님은 ${month}월 ${t}번의 야간콜택시 운행이 있었습니다.");document.location.href="/yacol";</script>`);
	  }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/on', async (req, res, next) => {
  try {
	 const { driver, level} = req.body;
	 const token = jwt.sign(
			{driver: driver, level:level},
			 process.env.JWT_SECRET
		);
	  const expiryDate = new Date( Date.now() + 60 * 60 * 1000 * 24 * 365);
	  res.cookie('MyCookie',token, { httpOnly: true,expires: expiryDate});
	  return res.send(`<script type="text/javascript">alert("정보입력이 완료되었습니다.");document.location.href="/";</script>`);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/comback', async (req, res, next) => {
  try {
	  const {combackDate, combackMonth,combackDay, combackDriver,combackDesti,combackKinds,combackNumbers} = req.body;
	  var t = 0;
	  if(combackDay == 0 ||combackDay == 6){
		  const jumal = await Jumal.findOne({
			  where: {
				  driver : combackDriver,
				  month:combackMonth
					 }
		  });
		  t = jumal.count;
	  }else{
		  const yac = await Yacol.findOne({
			  where: {
				  driver : combackDriver,
				  month:combackMonth
					 }
		  });
		  t = yac.count;
	  }
	  await send_back_message(combackDriver,combackDesti,combackKinds,combackNumbers);
	  res.clearCookie('YacolCookie');
	  if(combackDay == 0 ||combackDay == 6){
		  return res.send(`<script type="text/javascript">alert("고생하셨습니다. ${combackDriver}님은 ${combackMonth}월 ${t}번의 주말콜택시 운행이 있었습니다.");document.location.href="/yacol";</script>`);
	  }else{
		  return res.send(`<script type="text/javascript">alert("고생하셨습니다. ${combackDriver}님은 ${combackMonth}월 ${t}번의 야간콜택시 운행이 있었습니다.");document.location.href="/yacol";</script>`);
	  }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;