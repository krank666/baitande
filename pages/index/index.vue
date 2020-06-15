	<template>
		<view class="content">
			<view class="box">
				<view class="page-body box">
					<view class="page-section page-section-gap">
						<map :latitude="latitude" :longitude="longitude" :markers="covers" @callouttap="callouttap" @regionchange="regionchange"
						 id="map4select" style="width: 100%; height:100vh;"></map>
					</view>
				</view>
			</view>
			<view class="buttons shadow shadow-lg">
				<view class="flex justify-between padding-top-sm">
					<view class="flex padding-lr align-center user">
						<view class>
							<img :src="customerInfo.avatar?customerInfo.avatar:'../../static/head.png'" alt class="Img" />
						</view>
						<view class="padding-sm">{{customerInfo.customerName?customerInfo.customerName:'游客'}}</view>
					</view>
					<view class="flex padding-lr align-center">
						<button @getuserinfo="getuserinfo" class="cu-btn btns" data-target="DialogModal1" open-type="getUserInfo" v-if="!buttonFlag">
							<text class="lg cuIcon-shop"></text>出摊
						</button>
						<button @tap="cancel" class="cu-btn btns" v-if="buttonFlag">
							<text class="lg cuIcon-shop"></text>收摊
						</button>
					</view>
				</view>
				<view class="flex justify-between padding-bottom-sm">
					<view class="flex padding-lr align-center user">
						<view class="Img">
							<text class="lg cuIcon-locationfill"></text>
						</view>
						<view class="padding-sm total">附近共有{{covers.length-1}}个摊位</view>
					</view>
				</view>
			</view>
			<view v-if="modalName=='DialogModal1'" :class="modalName=='DialogModal1'?'show':''" class="cu-modal">
				<view class="cu-dialog dialog" style="width:85%;">
					<view class="cu-bar bg-white justify-end" style="height: 100rpx;">
						<view class="content rightClass">摊位信息</view>
						<view @tap="hideModal" class="action">
							<text class="cuIcon-close text-red"></text>
						</view>
					</view>
					<view class="padding-sm">
						<form action class="form">
							<view class="flex justify-between padding-tb-sm border-bot">
								<view class="text-bold">
									<text class="margin-right-xs star">*</text>摊位名称
								</view>
								<view class="text-right">
									<input name="input" maxlength="10" placeholder="必填" v-model="createStill.name" />
								</view>
							</view>
							<view class="flex justify-between padding-tb-sm border-bot">
								<view class="text-bold">
									<text class="margin-right-xs star">*</text>商品类型
								</view>
								<view class="text-right">
									<input name="input" placeholder="最多10个字" maxlength="10" v-model="createStill.tag" />
								</view>
							</view>
							<view class="flex justify-between padding-tb-sm border-bot">
								<view class="text-bold">
									<text class="margin-right-xs"></text>出摊时间
								</view>
								<view class="text-right">
									<picker mode="time" :value="time"  @change="TimeChange" style="display: inline-block; ">
										<view class="picker">
											{{startTime}}
										</view>
									</picker>
									-
									<picker mode="time" :value="time" @change="TimeChangeEnd" style="display: inline-block; ">
										<view class="picker">
											{{endTime}}
										</view>
									</picker>
								</view>
							</view>
							<view class="margin-bottom text-left">
								<view class="text-bold padding-tb padding-left-sm">
									摊位描述
									<text class="fr place">限最多80字</text>
								</view>
								<textarea class="textarea" maxlength="80" v-model="createStill.description" />
								</view>
			  </form>
			</view>
			<view class="cu-bar bg-white justify-end">
			  <view class="action">
				<button @tap="hideModal" class="cu-btn line-green text-green">取消</button>
				<button @tap="submit" class="cu-btn bg-green margin-left">出摊</button>
			  </view>
			</view>
		  </view>
		</view>

		<view v-if="modalName=='activeStillMode'" :class="modalName=='activeStillMode'?'show':''" class="cu-modal">
		  <view class="cu-dialog dialog" style="width:85%;">
			<view class="cu-bar bg-white justify-end" style="height: 100rpx;">
			  <view class="content">摊位信息</view>
			  <view @tap="hideModal" class="action">
				<text class="cuIcon-close text-red"></text>
			  </view>
			</view>
			<view class="padding-sm cu-list menu-avatar comment solids-top">
			  <view class="cu-item">
				<view
				  :style="{backgroundImage:`url(${activeStill.exaCustomer.avatar})`}"
				  class="cu-avatar round"
				></view>
				<view class="content">
				  <view class="text-grey">摊位名称： {{activeStill.name}}</view>
				  <view class="text-gray" style="text-align: left;">摊位详情： {{activeStill.description}}</view>
				  <view class="text-gray" style="text-align: left;">出摊时间： {{activeStill.start}} - {{activeStill.end}}</view>
				  <view class="bg-white radius margin-top-sm text-sm">
					<view class="margin-bottom text-left">摊位地址： {{activeStill.addr}}</view>
				  </view>
				</view>
			  </view>
			</view>
			<view class="cu-bar bg-white justify-end">
			  <view class="action">
				<button @tap="clearActiveModel" class="cu-btn bg-green margin-left">确定</button>
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
			btnLock:false,
		  customerInfo: {},
		  activeStill: {},
		  id: 0, // 使用 marker点击事件 需要填写id
		  title: 'map',
		  latitude: 0,
		  longitude: 0,
		  covers: [
			{
			  latitude: 0,
			  longitude: 0
			}
		  ],
		  code: '',
		  modalName: null,
		  createStill:{
			  name: '',
			  description: '',
			  tag:"",
			  open:true
		  },
		  buttonFlag: false,
		  startTime:'12:00',
		  endTime:'21:00'
		}
	  },

	  async onShow() {
		that = this
		that.openType()
		//获取用户位置
		that.refreshStillList()
		
	  },
	  onLoad() {
		that = this
		uni.login({
		  provider: 'weixin',
		  success: function(loginRes) {
			if (loginRes.errMsg == 'login:ok') {
			  const code = loginRes.code
			  const data = {
				code: code
			  }
			  customer(data).then(ele => {
				if (ele.code != 7) {
				  if (!uni.getStorageSync('customer')||(uni.getStorageSync('customer')&&!uni.getStorageSync('customer').openid)) {
					uni.setStorageSync('customer', ele.data)
				  }
				  that.customerInfo = uni.getStorageSync('customer')
				} else {
				  uni.showToast({
					title: ele.msg,
					duration: 3000,
					icon: 'none'
				  })
				}
			  })
			}
		  }
		})
		
		setInterval(()=>{
			that.refreshStillList()
		},20000)
	  },
	  methods: {
		regionchange(e) {
		  if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
			that.mapCtx = wx.createMapContext('map4select')
			that.mapCtx.getCenterLocation({
			  type: 'gcj02',
			  success: function(res) {
				that.latitude = res.latitude
				that.longitude = res.longitude 
				that.refreshStillList()
			  }
			})
		  }
		},
		async refreshStillList() {
			uni.getLocation({
			  type: 'gcj02',
			  success: async function(lonres) {
				  if(that.longitude==0&&that.latitude==0){
					  that.longitude = lonres.longitude
					  that.latitude = lonres.latitude
				  }
						const datas = {
							  lng: that.longitude,
							  lat: that.latitude
							}
				  const res = await findStillByLatAndLng(datas)
				  const coversArr = []
				  const Arr = res.data
				  Arr &&
					Arr.map((item, key) => {
					  const obj = {}
					  obj.id = item.ID
					  obj.latitude = item.lat
					  obj.longitude = item.lng
					  obj.iconPath = '../../static/still.png'
					  obj.width = 30
					  obj.height = 30
					  obj.callout = {
						id: item.ID,
						textAlign: 'left',
						content: "摊位："+item.name+"\n\n商品："+item.tag + '\n\n    查看详情 >',
						color: '#808080',
						fontSize: '12',
						borderRadius: '10',
						bgColor: '#ffffff',
						padding: '10',
						display: 'BYCLICK'
					  }
					  coversArr.push(obj)
					})
				  
				  
				  const cover = {}
				cover.latitude = lonres.latitude
				cover.iconPath = '../../static/self.png'
				cover.longitude = lonres.longitude
				cover.width = 25
				cover.height = 25
				that.covers = [cover, ...coversArr]
			  },
			  fail: function(res){
				that.covers = [that.covers[0], ...coversArr]
			  }
			})
		},
		async openType() {
		  const stillId = uni.getStorageSync('stillSuccess')
		  //打开小程序时 判断是否有摊位信息
		  if (stillId) {
			const res = await findStillById({ id: stillId })
			if(res.code == 0){
				 that.buttonFlag = res.data.open
				if (!res.data.open) {
				  uni.removeStorageSync('stillSuccess')
				}
			}
		  } else {
			console.log('摊位信息为空')
		  }
		},
		async getuserinfo(e) {
		  if ((e.detail.errMsg = 'getUserInfo:ok')) {
			const data = {
			  openid: uni.getStorageSync('customer').openid,
			  rawData: e.detail.rawData,
			  encryptedData: e.detail.encryptedData,
			  iv: e.detail.iv,
			  signature: e.detail.signature
			}
			const ele = await customerPUT(data)
			if(ele.code == 0){
				 uni.removeStorage({
				  key: 'customer'
				})
				uni.setStorageSync('customer', ele.data)
				that.customerInfo = uni.getStorageSync('customer')
				that.showModal({currentTarget:{dataset:{target:'DialogModal1'}}})
			}
		   
		  }
		},
		showModal(e) {
		  that.modalName = e.currentTarget.dataset.target
		},
		hideModal(e) {
		  that.modalName = null
		},
		async submit() {
			if(that.btnLock){
				return false
			}
			
			if(!that.createStill.name || !that.createStill.tag||!that.createStill.description){
				uni.showToast({
					icon:"none",
					title:"请完整填写摊位信息"
				})
				return false
			}
			that.btnLock = true
			let lng= 0
			let lat = 0
			uni.getLocation({
			  type: 'gcj02',
			  success:async function(res) {
				lng = res.longitude
				lat = res.latitude
				const data = {
				  exaCustomerId: uni.getStorageSync('customer').ID,
				  name: that.createStill.name,
				  description: that.createStill.description,
				  tag: that.createStill.tag,
				  lng: lng,
				  lat: lat,
				  open: true,
				  start:that.startTime,
				  end:that.endTime
				}
				const ele = await createStill(data)
				if (ele.code == 0) {
				  that.hideModal()
				  uni.setStorageSync('stillSuccess', ele.data.id)
				  uni.showToast({
					title: '出摊成功！',
					duration: 2000,
					icon: 'none',
				  })
				  that.openType()
				  that.refreshStillList()
				  that.createStill.name = ""
				  that.createStill.tag = "" 
				  that.createStill.description = ""
				} else {
				  uni.showToast({
					title: ele.msg,
					duration: 3000,
					icon: 'none'
				  })
				}
				that.btnLock = false
			  }
			})
		  
		},
		async cancel() {
			if(that.btnLock){
				return false
			}
			that.btnLock = true
		  const stillId = uni.getStorageSync('stillSuccess')
		  const res = await deleteStill({ id: stillId })
		  if (res.code == 0) {
			uni.showToast({
			  title: '收摊成功！',
			  duration: 2000,
			  icon: 'none',
			})
			that.openType()
			that.refreshStillList()
			that.btnLock = false
		  }
		},
		async callouttap(e) {
		  const res = await findStillById({ id: e.markerId })
		  if (res.code == 0) {
			that.activeStill = res.data.still
			that.modalName = 'activeStillMode'
		  }
		},
		clearActiveModel() {
		  that.modalName = ''
		  that.activeStill = {}
		},
		TimeChange(e) {
			this.startTime = e.detail.value
		},
		TimeChangeEnd(e) {
			this.endTime = e.detail.value
		},
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

	.star{
		color: red;
		display: inline-block;
		vertical-align:middle;
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
	  box-shadow: 3px 3px 2px 0 rgba(61, 122, 255, 0.4);
	}
	.activeBg {
	  background-color: #39b54a;
	}
	.rightClass {
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
	.total {
	  color: grey;
	}
	.title {
	  font-size: 30rpx;
	}
	.content {
	  height: auto;
	}
	.border-bot {
	  border-bottom: 1px solid #e2e5ec;
	}
	.form {
	  display: block;
	  padding: 30rpx;
	  background: #fff;
	  border-radius: 8rpx;
	}
	.place {
	  color: #808080;
	  font-weight: 400;
	}
	.textarea {
	  text-align: left;
	  border: 1px solid #e2e5ec;
	  border-radius: 10rpx;
	  width: 100%;
	  padding: 20rpx;
	}
	.shop {
	  width: 33%;
	}
	.Img {
	  width: 50rpx;
	  height: 50rpx;
	}
	.cuIcon-shop {
	  color: #fff !important;
	  font-size: 30rpx;
	  margin-right: 10rpx;
	}
	.cuIcon-locationfill {
	  font-size: 50rpx;
	  color: #007fff;
	}

	.title {
	  font-size: 30rpx;
	}
	.content {
	  height: auto;
	}
	/* .justify-between {
	  padding: 23upx 0;
	 } */

	.border-bot {
	  border-bottom: 1px solid #e2e5ec;
	}
	.form {
	  display: block;
	  padding: 30rpx;
	  background: #fff;
	  border-radius: 8rpx;
	}
	.place {
	  color: #808080;
	  font-weight: 400;
	}
	.textarea {
	  text-align: left;
	  border: 1px solid #e2e5ec;
	  border-radius: 10upx;
	  width: 100%;
	  padding: 20rpx;
	}
	.shop {
	  width: 33%;
	}
	.Img {
	  width: 50upx;
	  height: 50upx;
	}
	.cuIcon-shop {
	  color: #fff !important;
	  font-size: 30rpx;
	  margin-right: 10rpx;
	}
	.cuIcon-locationfill {
	  font-size: 50rpx;
	  color: #007fff;
	}
	</style>
