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
						<view class="flex justify-between">
							<view class="title">摊位名称</view>
							<view class="text-right"><input  placeholder="摊位叫什么" name="input" v-model="name"></input></view>
						</view>
						<view class="flex justify-between">
							<view class="title">摊位描述</view>
							<view class="text-right"><input placeholder="卖什么的" name="input" v-model="description"></input></view>
						</view>
					</form>
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-green text-green" @tap="hideModal">取消</button>
						<button class="cu-btn bg-green margin-left" @tap="submit">确定</button>

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
		findStillById
	} from '../../api/index.js'
	export default {
		data() {
			return {
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
				var this_ = this
				const stillId = uni.getStorageSync('stillSuccess')
				//打开小程序时 判断是否有摊位信息
				if(stillId){
					const res = await findStillById({id:stillId})
					console.log(res)
					this_.buttonFlag = res.data.open
				}else{
					console.log('摊位信息为空')
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
									obj.callout = {
									content: item.township + "\n" + item.street + "\n" + item.number,
									 width: 35,   
									 height: 30,   
									 color: "#ff0000",  
									 fontSize: "12",   
									  borderRadius: "10",  
									 bgColor: "#ffffff",  
									 padding: "10",  
									 display: 'BYCLICK'
									}
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
							uni.setStorageSync('stillSuccess',ele.data.id)
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
		width: 100%;
		height: auto;
		bottom: 0;
		text-align: center;
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
		width: 150upx;
		height: 150rpx;
		padding: 10upx;
		color: #fff;
		border-radius: 50%;
		margin-bottom: 40upx;
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
		color: #666666;
	}
	.content{
		height: auto;
	}
	.justify-between {
		padding: 23upx 0;
		border-bottom: 1px solid #e2e5ec;
	}
	.form{
		display: block;
		padding: 20rpx 30rpx 50rpx 30rpx;
		background: #fff;
		border-radius: 8rpx;
	}
</style>
