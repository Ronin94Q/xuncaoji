//app.js
const util = require('./utils/util.js') // 将工具函数导入进来
App({
  onLaunch: function(options) {
    var that = this;
    wx.login({
      success(res) {
        wx.setStorageSync('code', res.code)
      }
    })
  },
  Util: {
    ajax: util.ajax,
    deepCopy: util.deepCopy,
    getUrlImg: util.getUrlImg
  },
  globalData: {
    appid: 'wx49f6da054a1eb413',
    secret: 'e0dassdadef2424234209bwqqweqw123ccqwa',
    flag: false,
    scene: '',
    share: 0,
    provinces:{},
    creditCard:2,
    disBtn1: 1,//是否显示免费续约
    // cooperateInvitionCode:27194030 //测试环境
    cooperateInvitionCode: 55555555 //正式环境
  },

  //通用导航方法
  nav: function(e) {
    if (getCurrentPages().length < 10 && !e.currentTarget.dataset.type) {
      wx.navigateTo({
        url: e.currentTarget.dataset.url
      })
    } else {
      wx.reLaunch({
        url: e.currentTarget.dataset.url
      })
    }
  },

  onShow: function(options) {
    var that = this
    if(wx.getStorageSync('token')){
      setTimeout(function () {
        that.Util.ajax('mall/personal/cityData', 'GET').then((res) => { // 使用ajax函数
          // console.log("地址：" + JSON.stringify(res))
          if (res.data.messageCode = 'MSG_1001') {
            wx.setStorageSync('provinces', res.data.content)
          }
        })
      }, 3000)
    }
    that.globalData.scene = options.scene
    //判断是否已经授权过小程序
    wx.login({
      success(res) {
        // console.log("获取code成功");
        console.log('res.code:', res.code, res);
        // 用code到后台判断用户登录状态
        util.ajax('mall/personal/preference', {
          code: res.code
        }, 'GET').then((res) => {
          console.log('登录首选项查询：' + JSON.stringify(res.data.content))
          if (res.data.content.authAvatarNikeName == 1 && res.data.content.authMobileNumber == 1) {
            //此时不用再授权,自动进入登录状态
            wx.setStorageSync('authLoginStatus', 1)
            that.selfLogin()
          } else {
            //需登录授权
            wx.setStorageSync('authLoginStatus', 2)
          }
        })
      }
    })
  },
  onHide: function() {

  },
  onError:function(err){
    console.log(err)
  },
  //已经授权，自动进入登录状态设置
  selfLogin: function() {
    //刷新code
    wx.login({
      success(res) {
        wx.request({
          url: util.getUrlImg().publicUrl+'mall/account/authLogin',
          method: "POST",
          data: {
            code: res.code,
            authType: 2
          },
          header: {
            "content-type": 'application/json'
          },
          success: function(res) {
            if (res.data.content) {
              if (res.data.content.fresher == 2) {
                wx.setStorageSync('token', res.header.token)
                wx.setStorageSync('inviterCode', res.data.content.inviterCode)
              } else {
                // wx.setStorageSync('newUserCourtesyStatus', res.data.content.fresher)
              }
            }
          }
        })
      }
    })
  },
})