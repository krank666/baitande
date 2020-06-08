import myRequest from '../utils/request.js'
/*
* 将用户信息传给后台
*/
export const customer = (data)=>{
	return myRequest({
		url:'customer/customer',
		data,
		method:'POST'
	})
}

export const customerPUT = (data)=>{
	return myRequest({
		url:'customer/customer',
		data,
		method:'PUT'
	})
}

/**
 * 摆摊儿接口
 */
export const createStill = (data)=>{
	return myRequest({
		url:'still/createStill',
		data,
		method:'POST'
	})
}

/**
 * 调取周围摊位地址
 */
export const findStillByLatAndLng = (data)=>{
	return myRequest({
		url:'still/findStillByLatAndLng',
		data,
		method:'POST'
	})
}