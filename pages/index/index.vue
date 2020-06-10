<template>
	<view class="content">
		<view class="box">
			<view class="page-body box">
				<view class="page-section page-section-gap">
					<map style="width: 100%; height:100vh;" @callouttap="callouttap" :latitude="latitude" :longitude="longitude" :markers="covers">
					</map>
				</view>
			</view>
		</view>
		<view class="buttons shadow shadow-lg">
			<view class="flex justify-between padding-top-sm">
				<view class="flex solid-bottom padding-lr align-center user">
					<view class=""><img :src="customerInfo.avatar?customerInfo.avatar:'../../static/head.png'" class="Img" alt=""></view>
					<view class="padding-sm">{{customerInfo.customerName?customerInfo.customerName:'游客'}}</view>
				</view>
				<view class="flex solid-bottom padding-lr align-center ">
					<button class="cu-btn btns" open-type="getUserInfo" v-if="!buttonFlag"
					 @getuserinfo="test" @tap="showModal" data-target="DialogModal1"> <text class="lg cuIcon-shop"></text>出摊</button>
					 <button class="cu-btn btns" v-if="buttonFlag" @tap="cancel"> <text class="lg cuIcon-shop"></text>收摊</button>
				</view>
			</view>
			<view class="flex justify-between padding-bottom-sm">
				<view class="flex solid-bottom padding-lr align-center user">
					<view class="Img"><text class="lg cuIcon-locationfill"></text></view>
					<view class="padding-sm">当前所在朝阳区东大桥...</view>
				</view>
			</view>
		</view>
		<view class="cu-modal" :class="modalName=='DialogModal1'?'show':''">
			<view class="cu-dialog dialog" style="width:85%;">
				<view class="cu-bar bg-white justify-end" style="height: 100rpx;">
					<view class="content rightClass">摊位信息</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-sm">
					<form action="" class="form">
						<view class="flex justify-between padding-tb-sm border-bot">
							<view class=" text-bold"><text style="color: red;display: inline-block;vertical-align:middle;" class="margin-right-xs">*</text>摊位名称</view>
							<view class="text-right "><input placeholder="必填" name="input" v-model="name" /></view>
						</view>
						<view class="margin-bottom text-left">
							<view class="text-bold padding-tb padding-left-sm">摊位描述 <tevt class="fr place">限最多80字</tevt>
							</view>
							<textarea class="textarea" v-model="description" />
							</view>
					</form>
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-green text-green" @tap="hideModal">取消</button>
						<button class="cu-btn bg-green margin-left" @tap="submit">出摊</button>
					</view>
				</view>
			</view>
		</view>
		
		
		
		<view class="cu-modal" :class="modalName=='activeStillMode'?'show':''">
			<view class="cu-dialog dialog" style="width:85%;">
				<view class="cu-bar bg-white justify-end" style="height: 100rpx;">
					<view class="content">摊位信息</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-sm cu-list menu-avatar comment solids-top">
					<view class="cu-item">
						<view class="cu-avatar round" style="background-image:url(https://ossweb-img.qq.com/images/lol/img/champion/Morgana.png);"></view>
						<view class="content">
							<view class="text-grey">莫甘娜</view>
							<view class="text-gray text-content text-df">
								凯尔，你被自己的光芒变的盲目。
							</view>
							<view class="bg-white padding-sm radius margin-top-sm  text-sm">
								<view class="flex">
									<view>凯尔：</view>
									<view class="flex-sub">妹妹，你在帮他们给黑暗找借口吗?</view>
								</view>
							</view>
							<view class="margin-top-sm flex justify-between">
								<view class="text-gray text-df">2018年12月4日</view>
								<view>
									<text class="cuIcon-appreciatefill text-red"></text>
									<text class="cuIcon-messagefill text-gray margin-left-sm"></text>
								</view>
							</view>
						</view>
					</view>
					<!-- <text>{{activeStill.name}}</text>
					<text>{{activeStill.description}}</text>
					<text>{{activeStill.addr}}</text> -->
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn bg-green margin-left" @tap="clearActiveModel">确定</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		customer,
		customerPUT,
		createStill,
		findStillByLatAndLng,
		findStillById,
		deleteStill
	} from '../../api/index.js'
	let that
	export default {
		data() {
			return {
				customerInfo:{},
				activeStill:{},
				id: 0, // 使用 marker点击事件 需要填写id
				title: 'map',
				latitude: 0,
				longitude: 0,
				covers: [
					{
						latitude: 0,
						longitude: 0,
							callout: {content: "语言：珊珊是不是傻    \n    预计到达时间：10分钟    \n    车牌号:12345" ,
							 width: 35,   
							  height: 30,   
							 color: "#ff0000",  
							 fontSize: "16",   
							  borderRadius: "10",  
							 bgColor: "#ffffff",  
							 padding: "10",  
							 display: 'BYCLICK'
							}
						},
					],
					code: "",
					modalName: null,
					name: '',
					description: '',
					buttonFlag:false
				}
			},
			
			async onShow() {
				that = this
				that.openType()
				//获取用户位置
				uni.getLocation({
					type: 'wgs84',
					success: function(res) {
						console.log('当前位置的经度：' + res.longitude);
						console.log('当前位置的纬度：' + res.latitude);
						console.log('当前位置的纬度：' + res);
						that.longitude = res.longitude
						that.latitude = res.latitude
						that.covers[0].latitude = res.latitude
						that.covers[0].longitude = res.longitude
						that.refreshStillList()
					}
				});
			},
			onLoad() {
				that = this
					uni.login({
						provider: 'weixin',
						success: function(loginRes) {
							if (loginRes.errMsg == "login:ok") {
								const code = loginRes.code
								const data = {
									code: code
								}
								customer(data).then(ele => {
									if (ele.code != 7) {
										if(!uni.getStorageSync('customer')){
											uni.setStorageSync('customer', ele.data)
										}
										that.customerInfo = uni.getStorageSync('customer')
									} else {
										uni.showToast({
											title: ele.msg,
											duration: 3000,
											icon: "none",
										})
									}
								})
							}
						}
					})
					

				},
				methods: {
					async refreshStillList(){
						const datas={
							lng: that.longitude,
							lat: that.latitude,
						}
						const res = await findStillByLatAndLng(datas)
							const Arr = res.data
							Arr && Arr.map((item,key) => {
								const obj = {}
								obj.id = item.ID
								obj.latitude = item.lat
								obj.longitude = item.lng
								obj.callout = {
								id:item.ID,
								 content: item.township + "\n" + item.street + "\n" + item.number + "\n 查看详情  >",
								 color: "#ff0000",  
								 fontSize: "12",   
								 borderRadius: "10",  
								 bgColor: "#ffffff",  
								 padding: "10",  
								 display: 'BYCLICK'
								}
								that.covers.push(obj)
							})
					},
					async openType(){
						const stillId = uni.getStorageSync('stillSuccess')
						//打开小程序时 判断是否有摊位信息
						if(stillId){
							const res = await findStillById({id:stillId})
							that.buttonFlag = res.data.open
							if(!res.data.open){
							uni.removeStorageSync("stillSuccess")
						}	
						}else{
							console.log('摊位信息为空')
						}
					},
					async test(e) {
						if (e.detail.errMsg = "getUserInfo:ok") {
							const data = {
								openid: uni.getStorageSync('customer').openid,
								rawData: e.detail.rawData,
								encryptedData: e.detail.encryptedData,
								iv: e.detail.iv,
								signature: e.detail.signature
							}
							const ele = await customerPUT(data)
							uni.removeStorage({
								key: 'customer'
							});
							uni.setStorageSync('customer', ele.data)
							that.customerInfo = uni.getStorageSync('customer')
						}
					},
					showModal(e) {
						that.modalName = e.currentTarget.dataset.target
					},
					hideModal(e) {
						that.modalName = null
					},
					async submit() {
						const data = {
							exaCustomerId: uni.getStorageSync('customer').ID,
							name: that.name,
							description: that.description,
							lng: that.longitude,
							lat: that.latitude,
							open: true
						}
						const ele = await createStill(data)

						if (ele.code == 0) {
							that.hideModal()
							that.covers = []
							uni.setStorageSync('stillSuccess',ele.data.id)
							uni.showToast({
								title: '出摊成功！',
								duration: 2000,
								icon: "none",
								success() {
									that.openType()
									that.refreshStillList()
								}
							})
						} else {
							uni.showToast({
								title: ele.msg,
								duration: 3000,
								icon: "none",
							})
						}
					},
					async cancel(){
						
						const stillId = uni.getStorageSync('stillSuccess')
						const res = await deleteStill({id:stillId})
						if(res.code == 0){
							uni.showToast({
								title: '收摊成功！',
								duration: 2000,
								icon: "none",
								success() {
									that.openType()
									that.refreshStillList()
								}
							})
						}
					},
					async callouttap(e){
						const res = await findStillById({id:e.markerId})
						if(res.code == 0){
							that.activeStill = res.data.still
							that.modalName = "activeStillMode"
						}
					},
					clearActiveModel(){
						that.modalName = ''
						that.activeStill = {}
					}
				}
		}
</script>

<style scoped>
	.content {
		width: 100%;
		height: 100vh;
		position: relative;
	}
	.buttons {
		position: fixed;
		width: 98%;
		height: auto;
		bottom: 0;
		background: #fff;
		left: 1%;
		margin-bottom: 10rpx;
		/* box-shadow: 3px 3px 4px rgba(26, 26, 26, 0.4); */
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
		border-radius: 6rpx;
	}

	.dialog {
		height: auto;
	}

	.box {
		width: 100%;
	}
	.btns {
		min-width: 120rpx;
		height: 60rpx;
		padding: 20rpx;
		color: #fff;
		/* border-radius: 50%; */
		margin-left: 30rpx;
		background-color: #007fff;
		box-shadow: 3px 3px 2px 0 rgba(61, 122, 255, .4);
	}
	.activeBg {
		background-color: #39b54a;
	}
	.rightClass{
		margin-right: -70rpx;
	}
	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}
	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 30rpx;
	}
	.content{
		height: auto;
	}
	.border-bot{
		border-bottom: 1px solid #e2e5ec;
	}
	.form{
		display: block;
		padding: 30rpx;
		background: #fff;
		border-radius: 8rpx;
	}
	.place{
		color: #808080;
		font-weight: 400;
	}
	.textarea{
		text-align: left;
		border: 1px solid #e2e5ec;
		border-radius: 10rpx; 
		width: 100%; 
		padding: 20rpx;
	}
	.shop{
		width: 33%;
	}
	.Img{
		width: 50rpx;
		height: 50rpx;
	}
	.cuIcon-shop{
		color: #fff!important;
		font-size: 30rpx;
		margin-right: 10rpx;
	}
	.cuIcon-locationfill{
		font-size: 50rpx;
		color: #007fff;
	}

 .title {
  font-size: 30rpx;
 }
 .content{
  height: auto;
 }
 /* .justify-between {
  padding: 23upx 0;
 } */
 
 .border-bot{
  border-bottom: 1px solid #e2e5ec;
 }
 .form{
  display: block;
  padding: 30rpx;
  background: #fff;
  border-radius: 8rpx;
 }
 .place{
  color: #808080;
  font-weight: 400;
 }
 .textarea{
  text-align: left;
  border: 1px solid #e2e5ec;
  border-radius: 10upx; 
  width: 100%; 
  padding: 20rpx;
 }
 .shop{
  width: 33%;
 }
 .Img{
  width: 50upx;
  height: 50upx;
 }
 .cuIcon-shop{
  color: #fff!important;
  font-size: 30rpx;
  margin-right: 10rpx;
 }
 .cuIcon-locationfill{
  font-size: 50rpx;
  color: #007fff;
 }
</style>
