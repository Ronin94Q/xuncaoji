// pages/storedetails/storedetails.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    detail:{},
    pageNumber: 1,
    pageSize: 6,
    storeId:1,
    text:'',
    showModalStatus: false,//分享弹框
    shareList: {},//分享数据
    goodsId: 1,//分享id
    sharingProfit:''//分享返利
  },
  //分享
  share: function (e) {
    var that = this
    var goodsId = e.currentTarget.dataset.goodsid
    var sharingProfit = e.currentTarget.dataset.profit
    that.setData({
      goodsId: goodsId,
      sharingProfit: sharingProfit
    })
    //分享数据
    that.chooseShare()
    // console.log()
    that.setData({
      showModalStatus: true
    })
  },
  cancelShare: function () {
    var that = this
    that.setData({
      showModalStatus: false
    })
  },
  hideModal: function () {
    var that = this
    that.setData({
      showModalStatus: false
    })
  },
  //查询分享数据
  chooseShare: function () {
    var that = this
    app.Util.ajax('mall/weChat/sharing/target', { mode: 1, targetId: that.data.goodsId }, 'GET').then((res) => {
      if (res.messageCode = 'MSG_1001') {
        var inviterCode = wx.getStorageSync('inviterCode')
        if (inviterCode) {
          res.data.content.link = res.data.content.link.replace(/{inviterCode}/g, inviterCode)
        } else {
          res.data.content.link = res.data.content.link.replace(/{inviterCode}/g, '')
        }     
        that.setData({
          shareList: res.data.content
        })
      }
    })
  },
  //跳转到详情页
  toDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var id = options.id
    that.setData({
      storeId: options.id
    })
    //店铺详情
    app.Util.ajax('mall/home/storeDetail', { id: id }, 'GET').then((res) => {  // 使用ajax函数
      if (res.messageCode = 'MSG_1001') {
        that.setData({
          detail: res.data.content
        })
      }
    })
   that.init()
  },
  init:function(){
    var that = this
    //商品
    app.Util.ajax('mall/home/store/goods', {
      storeId: that.data.storeId,
      pageNumber: that.data.pageNumber,
      pageSize: that.data.pageSize
    }, 'GET').then((res) => {  // 使用ajax函数
      if (res.messageCode = 'MSG_1001') {
        that.setData({
          list: res.data.content.items
        })
      }
    })  
  },
  getMore:function(){
    var that = this
    var pageNumber = that.data.pageNumber + 1
    app.Util.ajax('mall/home/store/goods', {
      storeId: that.data.storeId,
      pageNumber: pageNumber,
      pageSize: that.data.pageSize
    }, 'GET').then((res) => { // 使用ajax函数
      if (res.messageCode = 'MSG_1001') {
        if (res.data.content.items == '' && that.data.list !== '') {
          that.setData({
            text: '已经到底啦'
          })
        }
        var arr = that.data.list
        for (var i = 0; i < res.data.content.items.length; i++) {
          arr.push(res.data.content.items[i])
        }
        that.setData({
          list: arr,
        })
        that.setData({
          pageNumber: pageNumber
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    that.getMore()
  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function (ops) {
    var that = this
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      that.setData({
        showModalStatus: false
      })
      app.Util.ajax('mall/weChat/sharing/onSuccess', { mode: 1 }, 'POST').then((res) => {
        if (res.data.content) {
          wx.showToast({
            title: '分享成功',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }
    return {
      title: that.data.shareList.title,
      path: that.data.shareList.link,
      imageUrl: that.data.shareList.imageUrl,
      success: function (res) {
       
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }
})