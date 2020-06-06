<template>
	<view class="content">
		1111
		<view>
			<view class="page-body">222
				<view class="page-section page-section-gap">
					<map style="width: 100%; height: 300px;" :latitude="latitude" :longitude="longitude" :markers="covers">
					</map>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {customer} from '../../api/index.js'
	export default {
		data() {
			return {
				id: 0, // 使用 marker点击事件 需要填写id
				title: 'map',
				latitude: 39.909,
				longitude: 116.39742,
				covers: [{
					latitude: 39.909,
					longitude: 116.39742,
				}, {
					latitude: 39.90,
					longitude: 116.39,
				}],
				code:""
			}
		},
		created() {
			uni.login({
			  provider: 'weixin',
			  success: function (loginRes) {
				if(loginRes.errMsg == "login:ok"){
					const code = loginRes.code 
					const data = {
						code:code
					}
					customer(data).then(ele=>{
						
					})
				}
			  }
			})
		},
		methods: {

		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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
