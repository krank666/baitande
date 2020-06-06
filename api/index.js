import myRequest from '../utils/request.js'
/*
* 将用户信息传给后台
*/
export const customer = (data)=>{
	return myRequest({
		url:'/customer/customer',
		data,
		method:'POST'
	})
}