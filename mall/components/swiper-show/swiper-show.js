// components/swiper-show/swiper-show.js
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    interval: 7000,
    duration: 0,
    easingFunction: "linear", //指定 swiper 切换缓动动画类型
    swiperData: [], //请求回来的页面数据
    pageNumber: 1,
    pageSize: 50,
    isSwiper:false, //是否显示轮图组件
    hostUrl: app.Util.getUrlImg().hostUrl,
  },

  /**
   * 组件的方法列表
   */
  attached() {
    var that = this
    that.getPageData()
  },
  methods: {
    // 获取页面数据
    getPageData: function() {
      var that = this
      wx.request({
        url: app.Util.getUrlImg().publicUrl + 'mall/home/textSlideShow',
        method: "GET",
        data: {
          pageNumber: that.data.pageNumber,
          pageSize: that.data.pageSize
        },
        header: {
          "content-type": 'application/json',
          token: '' || wx.getStorageSync('token'),
        },
        success: function (res) {
          if (res.data.messageCode == "MSG_1001") {
            that.setData({
              swiperData: res.data.content.items,
              isSwiper: true
            })
          }
        }
      })
    },
    // 轮播图current改变的事件
    currentChange: function(e) {
      var that = this
      var current = e.detail.current
      var pageNumber = that.data.pageNumber
      var pageSize = that.data.pageSize
      var swiperData = that.data.swiperData
      var index = current + 1
      if (index == pageNumber * pageSize) {
        that.data.pageNumber++;
        wx.request({
          url: app.Util.getUrlImg().publicUrl + 'mall/home/textSlideShow',
          method: "GET",
          data: {
            pageNumber: that.data.pageNumber,
            pageSize: that.data.pageSize
          },
          header: {
            "content-type": 'application/json',
            token: '' || wx.getStorageSync('token'),
          },
          success: function (res) {
            if (res.data.messageCode == "MSG_1001") {
              res.data.content.items.forEach(item => {
                swiperData.push(item)
              })
              that.setData({
                swiperData: swiperData
              })
            }
          }
        })
      }
    },
  }
})