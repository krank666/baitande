<template>
	<view class="content">
		<view class="box">
			<view class="page-body box">222
				<view class="page-section page-section-gap">
					<map style="width: 100%; height:400px" :latitude="latitude" :longitude="longitude" :markers="covers">
					</map>
				</view>
			</view>
		</view>
		<view class="buttons">
			<button class="cu-btn btns" open-type="getUserInfo" @getuserinfo="test">我要摆摊儿</button>
			<!-- <button class="cu-btn block line-blue margin-tb-sm lg" disabled>无效状态</button> -->
		</view>
	</view>
</template>

<script>
	import {
		customer,
		customerPUT
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
				code: ""
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
			uni.getLocation({
			    type: 'wgs84',
			    success: function (res) {
			        console.log('当前位置的经度：' + res.longitude);
			        console.log('当前位置的纬度：' + res.latitude);
					this_.longitude = res.longitude
					this_.latitude = res.latitude
					this_.covers[0].latitude = res.latitude
					this_.covers[0].longitude = res.longitude
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
					    key: 'customer',
					    success: function (res) {
					        console.log('success');
							uni.setStorageSync('customer', res.data)
					    }
					});
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
		width: 100%;
		height: auto;
		bottom: 0;
		border-top: 1rpx solid lightgrey;
	}

	.box {
		width: 100%;
	}

	.btns {
		width: 80%;
		height: 70rpx;
		margin: 20rpx 10%;
		color: #fff;
		background-color: orange;
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
