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
		<view class="buttons shadow shadow-lg">
			<view class="flex justify-between padding-top-sm">
				<view  class="flex solid-bottom padding-lr align-center user">
					<view class=""><img src="../../static/logo.png"  class="Img" alt="" ></view>
					<view class="padding-sm">张某某</view>
				</view>
				<view  class="flex solid-bottom padding-lr align-center ">
					<button class="cu-btn btns" :class="modalName=='DialogModal1'? 'activeBg' :''" open-type="getUserInfo" @getuserinfo="test"
					 @tap="showModal" data-target="DialogModal1"> <text class="lg cuIcon-shop"></text>摆摊</button>
				</view>
			</view>
			<view class="flex justify-between padding-bottom-sm">
				<view  class="flex solid-bottom padding-lr align-center user">
					<view class="Img"><text class="lg cuIcon-locationfill"></text></view>
					<view class="padding-sm">当前所在朝阳区东大桥...</view>
				</view>
			</view>
		</view>
		<view class="cu-modal" :class="modalName=='DialogModal1'?'show':''">
			<view class="cu-dialog dialog" style="width:85%;">
				<view class="cu-bar bg-white justify-end" style="height: 100rpx;">
					<view class="content">摊位信息</view>
					<view class="action" @tap="hideModal">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-sm">
					<form action="" class="form">
						<view class="flex justify-between padding-tb-sm border-bot">
							<view class=" text-bold"><text style="color: red;display: inline-block;vertical-align:middle;" class="margin-right-xs">*</text>摊位名称</view>
							<view class="text-right " ><input  placeholder="必填" name="input" v-model="name"></input></view>
						</view>
						<view class="margin-bottom text-left">
							<view class="text-bold padding-tb padding-left-sm">摊位描述 <tevt class="fr place">限最多80字</tevt></view>
							<textarea  class="textarea" v-model="description" />
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

</style>
