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
			<button class="cu-btn btns" :class="modalName=='DialogModal1'? 'activeBg' :''" open-type="getUserInfo" @getuserinfo="test" @tap="showModal" data-target="DialogModal1">摆摊</button>
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
				<view class="padding-xl">
					<form action="">
						<view class="cu-form-group">
							<view class="title">摊位名称</view>
							<input placeholder="摊位叫什么" name="input" v-model="name"></input>
						</view>
						<view class="cu-form-group">
							<view class="title">摊位描述</view>
							<input placeholder="卖什么的" name="input" v-model="description"></input>
						</view>
						<!-- <view class="cu-form-group">
							<view class="title">摊位地址</view>
							<input placeholder="请输入您的摊位地址" name="input" v-model=""></input>
						</view> -->
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
				}],
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
							uni.setStorageSync('customer', ele.data)
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
						lng:res.longitude,
						lat:res.latitude
					}
					findStillByLatAndLng(data).then(res=>{
						const Arr = res.data
						Arr&&Arr.map(item=>{
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
					uni.removeStorage({key: 'customer'});
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
					lat: this.latitude
				}
				const ele = await createStill(data)
				if(ele.code == 0){
					this.hideModal()
					uni.showToast({
					    title: '出摊成功！',
					    duration: 2000,
						icon:"none",
						success:{
							
						}
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
	     box-shadow:4px 4px 4px 0 rgba(61, 122, 255, .6) ;
	  }
	  .activeBg{
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
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
