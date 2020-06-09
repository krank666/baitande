<template>
	<view class="content">
		<view class="box">
			<view class="page-body box">
				<view class="page-section page-section-gap">
					<map style="width: 100%; height:100vh;" :latitude="latitude" :longitude="longitude" :markers="covers">
					</map>
				</view>
			</view>
		</view>
		<view class="buttons">
			<!-- <view  class="flex solid-bottom padding align-center user">
				<view class=""><img src="../../static/logo.png"  class="userImg" alt="" ></view>
				<view class="padding-sm">用户名</view>
			</view> -->
			<!-- <view class="shop">
				<text class="lg text-gray cuIcon-shop"></text>
				<view>摆摊</view>
			</view> -->
			<view class="flex justify-between">
				<view  class="flex solid-bottom padding-lr align-center user">
					<view class=""><img src="../../static/logo.png"  class="userImg" alt="" ></view>
					<view class="padding-sm">用户名</view>
				</view>
				<view  class="flex solid-bottom padding-lr align-center " open-type="getUserInfo" @getuserinfo="test"
			 @tap="showModal" data-target="DialogModal1">
					<view class=""><text class="lg cuIcon-shop"></text></view>
					<view class="padding-sm" >去摆摊</view>
				</view>
			<!-- 	<view class="cu-item">
					<text class="lg cuIcon-shop"></text>
					<text class="text-black">去摆摊</text>
				</view> -->
			</view>
			
			<button class="cu-btn btns" :class="modalName=='DialogModal1'? 'activeBg' :''" open-type="getUserInfo" @getuserinfo="test"
			 @tap="showModal" data-target="DialogModal1">摆摊</button>
			<!-- <button class="cu-btn block line-blue margin-tb-sm lg" disabled>无效状态</button> -->
		</view>
		<view class="cu-modal" :class="modalName=='DialogModal1'?'show':''">
			<view class="cu-dialog dialog">
				<view class="cu-bar bg-white justify-end" style="height: 100rpx;">
					<view class="content">摊位信息</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-sm">
					<form action="" class="form">
						<view class="flex justify-between border-bot">
							<view class=" text-bold">摊位名称</view>
							<view class="text-right"><input  placeholder="必填" name="input" v-model="name"></input></view>
						</view>
						<!-- <view class="flex justify-between">
							<view class="title">摊位描述</view>
							<view class="text-right"><input placeholder="卖什么的" name="input" v-model="description"></input></view>
						</view> -->
						<view class="margin-bottom text-left">
							<view class="text-bold padding-tb">摊位描述 <tevt class="fr place">限最多80字</tevt></view>
							<textarea  class="textarea" v-model="description" />
							<!-- <view class="text-right margin-top-sm">{{fontNumber}}/200</view> -->
						</view>
						<!-- <view class="cu-form-group padding-left-xl">
							<view class="title">摊位名称</view>
							<input placeholder="摊位叫什么" name="input" v-model="name"></input>
						</view>
						<view class="cu-form-group padding-left-xl">
							<view class="title">摊位描述</view>
							<input placeholder="卖什么的" name="input" v-model="description"></input>
						</view> -->
						<!-- <view class="cu-form-group">
							<view class="title">摊位地址</view>
							<input placeholder="请输入您的摊位地址" name="input" v-model=""></input>
						</view> -->
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
	</view>
</template>

<script>
	import {
		customer,
		customerPUT,
		createStill,
		findStillByLatAndLng
	} from '../../api/index.js'
	export default {
		data() {
			return {
				id: 0, // 使用 marker点击事件 需要填写id
				title: 'map',
				latitude: 0,
				longitude: 0,
				covers: [{
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
						 display:"BYCLICK" 
						}
						},
						
						],
					code: "",
					modalName: null,
					name: '',
					description: ''
				}
			},
			created() {
					const this_ = this
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
										uni.setStorageSync('customer', ele.data)
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
					//获取用户位置
					uni.getLocation({
						type: 'wgs84',
						success: function(res) {
							console.log('当前位置的经度：' + res.longitude);
							console.log('当前位置的纬度：' + res.latitude);
							this_.longitude = res.longitude
							this_.latitude = res.latitude
							this_.covers[0].latitude = res.latitude
							this_.covers[0].longitude = res.longitude
							const data = {
								lng: res.longitude,
								lat: res.latitude
							}
							findStillByLatAndLng(data).then(res => {
								const Arr = res.data
								Arr && Arr.map(item => {
									const obj = {}
									obj.latitude = item.lat
									obj.longitude = item.lng
									this_.covers.push(obj)
								})
							})
							console.log(this_.covers)
						}
					});

				},
				methods: {
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
						}
					},
					showModal(e) {
						this.modalName = e.currentTarget.dataset.target
					},
					hideModal(e) {
						this.modalName = null
					},
					async submit() {
						const data = {
							exaCustomerId: uni.getStorageSync('customer').ID,
							name: this.name,
							description: this.description,
							lng: this.longitude,
							lat: this.latitude,
							open: true
						}
						const ele = await createStill(data)

						if (ele.code == 0) {
							this.hideModal()
							this.covers = []
							console.log(this.covers)
							const that = this
							uni.showToast({
								title: '出摊成功！',
								duration: 2000,
								icon: "none",
								success() {
									const datas = {
										lng: that.longitude,
										lat: that.latitude,
									}
									findStillByLatAndLng(datas).then(res => {
										const Arr = res.data
										Arr && Arr.map(item => {
											const obj = {}
											obj.latitude = item.lat
											obj.longitude = item.lng
											that.covers.push(obj)
										})
									})
								}
							})
							console.log(this.covers)
						} else {
							uni.showToast({
								title: ele.msg,
								duration: 3000,
								icon: "none",
							})
						}
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

	/* .buttons {
		position: fixed;
		width: 100%;
		height: auto;
		bottom: 0;
		border-top: 1rpx solid lightgrey;
	} */
	.buttons {
		position: fixed;
		width: 98%;
		height: auto;
		bottom: 0;
		background: #fff;
		left: 1%;
		margin-bottom: 10rpx;
	}

	.dialog {
		height: auto;
	}

	.box {
		width: 100%;
	}

	/* .btns {
		width: 80%;
		height: 70rpx;
		margin: 20rpx 10%;
		color: #fff;
		background-color: orange;
	} */
	.btns {
		width: 120upx;
		height: 80rpx;
		padding: 10upx;
		color: #fff;
		/* border-radius: 50%; */
		margin-bottom: 40upx;
		margin-left: 30upx;
		background-color: #007fff;
		box-shadow: 4px 4px 4px 0 rgba(61, 122, 255, .6);
	}

	.activeBg {
		background-color: #39b54a;
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
		/* color: #666666; */
	}
	.content{
		height: auto;
	}
	.justify-between {
		padding: 23upx 0;
	}
	.border-bot{
		border-bottom: 1px solid #e2e5ec;
	}
	.form{
		display: block;
		padding: 20rpx 30rpx 50rpx 30rpx;
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
	.userImg{
		width: 50upx;
		height: 50upx;
	}
	.cuIcon-shop{
		color: #007fff!important;
		font-size: 40rpx;

	}
	.cu-item:after{
		content: '';
		-webkit-transform:scale(0)!important;
		transform:scale(0)!important;
	}
</style>
