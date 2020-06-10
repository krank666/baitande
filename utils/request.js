// 请求方法
const myRequest = ({
    url,
    data,
    method = 'POST',
    proxy = 'api',
    commonInfo = {}
}) => {
    let lock = true
    setTimeout(() => {
        if (lock) {
            uni.showLoading({
                title: 'loading...',
                mask: true
            });
        }
    }, 200)

    // 返回请求的结果 通过Promise返回 支持 then catch
    return new Promise((resolve, reject) => {
        let BASEURL
        switch (proxy) {
            case 'api':
                BASEURL = 'http://10.188.68.88:8881/'
                // BASEURL = 'https://tantu.henrongyi.top/v1/'
                break;
            case 'admin':
                // BASEURL = 'https://www.staroftomorrow.cn/api'
				BASEURL = 'http://10.188.68.59:8099'
                // BASEURL = 'https://www.staroftomorrow.cn/api'
                    BASEURL = 'http://10.188.68.59:8099'
                break;
            default:
                break;
        }
        const userInfo = uni.getStorageSync('userInfo')
        uni.request({
            url: BASEURL + url,
            method: method,
            data: {
                commonInfo: {
                    "requestClient": '2',
                    "loginUserType": '1',
                    "loginUserCode": '1101',
                    ...commonInfo
                },
                ...data
            },
            header: {
                'content-type': 'application/json',
                'accessToken': userInfo.token
            }
        }).then(res => {
            lock = false
            uni.hideLoading()
            if (res[0]) {
                resolve(res[0]) //错误信息
            } else {
                if (res[1].data.success) {
                    resolve(res[1].data) //请求返回信息
                } else {
                    resolve(res[1].data) //请求返回信息
                }
            }
        }).catch(err => {
            lock = false
            uni.hideLoading()
        })
    })
}

export default myRequest