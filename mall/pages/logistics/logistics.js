// pages/logistics/logistics.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hostUrl: app.Util.getUrlImg().hostUrl,
    logisticsId:null,//订单id
    list:[],//物流列表
    options:{},
    status:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      logisticsId: parseInt(options.logisticsId),
      options: options
    })
    that.init()
  },
  //初始化物流信息
  init:function(){
    var that = this
    var logisticsId = that.data.logisticsId
    app.Util.ajax(`mall/order/queryLogisticsById?logisticsId=${logisticsId}`,null, 'GET').then((res) => { // 使用ajax函数
      if (res.data.content) {
        for(var i=0;i<res.data.content.list.length;i++){
          res.data.content.list[i].date = (res.data.content.list[i].datetime).slice(5, 10);
          res.data.content.list[i].time = (res.data.content.list[i].datetime).slice(11, 16);
        }
        that.setData({
          content: res.data.content,
          list: (res.data.content.list).reverse(),
          status:res.data.content.status
        })
      }else{
        wx.showToast({
          title: res.data.message,
          icon:'none'
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
    var that = this
    that.onLoad(that.data.options)
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //点击复制
  copyText: function (e) {
    var that = this
    var text = e.currentTarget.dataset.text
    var text1 = text.toString()
    wx.setClipboardData({
      data: text1,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功',
              icon: 'none'
            })
            that.setData({
              showInviterCode: false
            })
          }
        })
      }
    })
  },
})