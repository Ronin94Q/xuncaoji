// pages/loginWay/loginWay.js
let app = getApp();
const util = require('../../utils/util.js') // 将工具函数导入进来
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hostUrl: app.Util.getUrlImg().hostUrl,
    provinces: []
  },
  //跳转到手机登录
  jumpPhoneLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login?pageNum=' + 4,
    })
  },
  getPhoneNumber: function(e){
    console.log(e)
    var that = this
    //给当前地址添加缓存，授权之后跳转回原页面
    var encryptedData = e.detail.encryptedData
    var iv = e.detail.iv
    //刷新code
    wx.login({
      success(res) {
        console.log("获取code成功");
        console.log('res.code:', res.code, res);
        var code = res.code
        var inviterCode1 = wx.getStorageSync('inviterCode1') || ''
        if (e.detail.errMsg == 'getPhoneNumber:ok') {
          wx.setStorageSync('encryptedData', encryptedData)
          wx.setStorageSync('iv', iv)
          var pages = getCurrentPages() //获取加载的页面
          var currentPage = pages[pages.length - 3]?pages[pages.length - 3] :'' //获取当前页面的对象
          var url = currentPage.route?currentPage.route:''
          console.log(getCurrentPages())
          console.log(url)
          if (url == 'pages/detail/detail') {
            if (wx.getStorageSync('stages')) {
              wx.setStorage({
                key: "url",
                data: url + '?id=' + wx.getStorageSync('goods_id')+'&&stages=' + wx.getStorageSync('stages')
              })
            }else{
              wx.setStorage({
                key: "url",
                data: url + '?id=' + wx.getStorageSync('goods_id')
              })
            }            
          } else if (url == 'packageB/pages/zeroPurchase/zeroPurchase') {
            wx.setStorage({
              key: "url",
              data: url + '?id=' + wx.getStorageSync('zeroGoods_id') + '&&type=' + wx.getStorageSync('type') + '&&orgPrice=' + wx.getStorageSync('orgPrice')
            })
          }else if (url == 'packageB/pages/zeroPurchaseActivity/zeroPurchaseActivity') {
            wx.setStorage({
              key: "url",
              data: url
            })
          }else if (url == 'packageA/pages/storeEnter/storeEnter') {
            wx.setStorage({
              key: "url",
              data: url
            })
          } else if (url == 'packageB/pages/zeroBuy/zeroBuy') {
            wx.setStorage({
              key: "url",
              data: url
            })
          } else if (url == 'packageA/pages/seedMask/seedMask') {
            wx.setStorage({
              key: "url",
              data: url
            })
          } else if (url == 'packageB/pages/cooperate/cooperate') {
            wx.setStorage({
              key: "url",
              data: url
            })
          } else if (url == 'packageA/pages/shareMentionPeriod/shareMentionPeriod') {
            wx.setStorage({
              key: "url",
              data: url
            })
          } else if (url == 'pages/wishpool/wishpool') {
            wx.setStorage({
              key: "url",
              data: url
            })
          } else if (url == 'packageB/pages/freeBuy/freeBuy') {
            wx.setStorage({
              key: "url",
              data: url
            })
          }else if(url == 'pages/lovingHeart/lovingHeart'){
            wx.setStorage({
              key: "url",
              data: url
            })
          }else if(url == 'pages/friendSponsor/friendSponsor'){
            wx.setStorage({
              key: "url",
              data: url
            })
          }else if(url == 'pages/sponsor/sponsor'){
            wx.setStorage({
              key: "url",
              data: url
            })
          } else if (url == 'pages/takeoutHomeage/takeoutHomeage') {
            wx.setStorage({
              key: "url",
              data: url
            })
          }else if (url == 'packageA/pages/takeoutHomeage/takeoutHomeage') {
            wx.setStorage({
              key: "url",
              data: url
            })
          }else if (url == 'packageA/pages/placeorderSearch/placeorderSearch') {
            wx.setStorage({
              key: "url",
              data: 'packageA/pages/takeoutHomeage/takeoutHomeage'
            })
          }
          wx.request({
            url: util.getUrlImg().publicUrl+'mall/account/authLogin',
            method: "POST",
            data: {
              code: res.code,
              authType: 1,
              encryptedData: encryptedData,
              iv: iv,
              inviterCode: inviterCode1
            },
            header: {
              "content-type": 'application/json',
              deviceId:'81c28f8d-fdbd-4a58-9c77-e59f98fa2513'
            },
            success: function(res) {
              if (res.data.messageCode === 'MSG_1001') {
                wx.removeStorageSync('token')
                wx.setStorageSync('token', res.header.token)
                wx.setStorageSync('inviterCode', res.data.content.inviterCode)
                wx.setStorageSync('newUserCourtesyStatus', res.data.content.fresher)
                app.Util.ajax('mall/personal/cityData', 'GET').then((res) => { // 使用ajax函数
                  if (res.data.messageCode == 'MSG_1001') {
                    that.setData({
                      provinces: res.data.content
                    })
                    wx.setStorageSync('provinces', res.data.content)
                    app.globalData.flag = true
                    wx.switchTab({
                      url: '/pages/index/index'
                    })
                  }
                }) 
                console.log("aaa"+JSON.stringify(res))
              } else if (res.data.messageCode === 'MSG_4001') {
                wx.redirectTo({
                  url: '/pages/invitationCode/invitationCode?tips=' + '请填写正确的邀请码'
                })
                wx.setStorageSync('tips', '请填写正确的邀请码')
              } else if (res.data.messageCode === 'MSG_4002') {
                console.log(666)
                wx.showToast({
                  title: '您的微信昵称含有特殊字符，请先修改微信昵称后再登录',
                  icon: 'none',
                  duration: 2000
                })
              } else {
              }
              wx.removeStorageSync('othersInviterCode')
            },
            fail:function(res){
              wx.showToast({
                title: '登录失败，请重新登录！',
                icon:'none'
              })
            }
          })
          // app.Util.ajax('mall/account/authLogin', {
          //   encryptedData: encryptedData,
          //   iv: iv,
          //   code: code,
          //   inviterCode: inviterCode1,
          //   authType:1
          // }, 'POST').then((res) => {
          //   console.log("登录："+JSON.stringify(res))
          //   if (res.data.messageCode === 'MSG_1001') {
          //     wx.removeStorageSync('token')
          //     wx.setStorageSync('token', res.header.token)
          //     wx.setStorageSync('inviterCode', res.data.content.inviterCode)
          //     wx.setStorageSync('newUserCourtesyStatus', res.data.content.fresher)
          //     app.Util.ajax('mall/personal/cityData', 'GET').then((res) => { // 使用ajax函数
          //       if (res.data.messageCode == 'MSG_1001') {
          //         that.setData({
          //           provinces: res.data.content
          //         })
          //         wx.setStorageSync('provinces', res.data.content)
          //         app.globalData.flag = true
          //         wx.switchTab({
          //           url: '/pages/index/index'
          //         })
          //       }
          //     }) 
          //     console.log("aaa"+JSON.stringify(res))
          //   } else if (res.data.messageCode === 'MSG_4001') {
          //     wx.redirectTo({
          //       url: '/pages/invitationCode/invitationCode?tips=' + '请填写正确的邀请码'
          //     })
          //   } else if (res.data.messageCode === 'MSG_4002') {
          //     console.log(666)
          //     wx.showToast({
          //       title: '您的微信昵称含有特殊字符，请先修改微信昵称后再登录',
          //       icon: 'none',
          //       duration: 2000
          //     })
          //   } else {
          //   }
          //   wx.removeStorageSync('othersInviterCode')
          // }).catch((err)=>{
          //   console.log(err)
          //   wx.showToast({
          //     title: '登录失败，请重新登录！',
          //     icon:'none'
          //   })
          // })
        } else {
          app.globalData.flag = false
          wx.navigateTo({
            url: '/pages/login/login?pageNum=' + 4,
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})