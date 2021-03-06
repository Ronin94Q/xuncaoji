// pages/myorder/myorder.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sellOneStatus:false,
    sellTwoStatus:false,
    payStatus:false,
    hostUrl: app.Util.getUrlImg().hostUrl,
    orderShowStatus:true,//点击退款列表状态
    currentTab: '',
    orderTabItem: [{
        title: '全部',
        select: true,
        status: '0'
      },
      {
        title: '待支付',
        select: false,
        status: '1'
      },
      {
        title: '待发货',
        select: false,
        status: '2'
      },
      {
        title: '待收货',
        select: false,
        status: '4'
      },
      {
        title: '待评价',
        select: false,
        status: '5'
      },
      {
        title: '退款/售后',
        select: false,
        status: '7, 8, 9, 10, 11'
      }
    ],
    allOrder: null,
    list: [], //更多好货
    pageNumber: 1,
    pageNumber1:1,
    pageSize: 20,
    text: '',
    text1: '',
    showDialog: false, //确认收货弹框
    showDialog1: false, //取消退款
    showDialog2: false, //退款
    refundorderId: 1, //退款id
    refund: ['质量问题', '长时间未发货', '我不想买了', '其他原因'], //退款申请理由
    current: 0, //获取退款理由
    reason: '质量问题',
    cancelOrder: ['我不想买了', '写错重拍', '卖家缺货', '其他原因'], //取消订单
    showDialog3: false, //取消订单弹框
    reason1: '我不想买了', //取消订单理由
    options: {},
    status: '',
    orderId: 0,
    seedToast:false//预售种子消耗弹窗
  },
  // 跳转到订单详情
  jumpOrderDetail: function(e) {
    app.nav(e)
  },
  //跳转到分期返现明细
  periodCash: function(e) {
    var orderId = e.currentTarget.dataset.orderid
    var latestStatus = e.currentTarget.dataset.lateststatus
    var whetherAdvanceSale = e.currentTarget.dataset.whetheradvancesale
    var defaultAmountStatus = e.currentTarget.dataset.defaultamountstatus
    wx.navigateTo({
      url: `/pages/cashBack/cashBack?orderId=${orderId}&latestStatus=${latestStatus}&whetherAdvanceSale=${whetherAdvanceSale}&defaultAmountStatus=${defaultAmountStatus}`,
    })
  },
  //跳转至店铺详情
  jumpStoreDetail: function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/storedetails/storedetails?id=${id}`,
    })
  },
  //跳转到详情页
  toDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //控制页面跳转
    app.globalData.returnMentionPeriodStatus==1
    
    if(wx.getStorageSync("orderShowStatus")){
      for (var i in that.data.orderTabItem) {
        that.setData({
          [`orderTabItem[${i}].select`]: false
        });
      }
      that.setData({
        [`orderTabItem[5].select`]: true,
        orderShowStatus:false,
        returnShowStatus:true
      });
      app.Util.ajax('mall/orderRefund/queryRefundOrderList', {
        pageNumber: 1,
        pageSize: 20
      }, 'GET').then((res) => { // 使用ajax函数
        if (res.data.content) {
          that.setData({
            returnOrder:res.data.content.items
          })
        }
      })
      setTimeout(function(){
        wx.removeStorageSync("orderShowStatus")
      },2000)
    }
    if (options) {
      if (options.inviterCode) {
        wx.setStorage({
          key: "othersInviterCode",
          data: options.inviterCode
        })
      }
    }
    var status;
    if (options.status === '0') {
      status = parseInt(options.status)
      that.setData({
        status: status
      })
      that.initgetMore1();
    } else {
      status = options.status
      that.setData({
        status: status
      })
      app.Util.ajax('mall/order/queryOrderListByUserId', {
        pageNumber: that.data.pageNumber,
        pageSize: that.data.pageSize,
        latestStatus: status
      }, 'GET').then((res) => { // 使用ajax函数
        if (res.data.content) {
          that.setData({
            allOrder: res.data.content.items
          })
          that.init()
        }
      })
    }
    that.setData({
      currentTab: status
    })
    for (let i of that.data.orderTabItem) {
      if (i.status == options.status) {
        that.setData({
          [`orderTabItem[${that.data.orderTabItem.indexOf(i)}].select`]: true
        })
      } else {
        that.setData({
          [`orderTabItem[${that.data.orderTabItem.indexOf(i)}].select`]: false
        })
      }
    }
  },
  //更多好货
  init: function() {
    var that = this
    var pageNumber = that.data.pageNumber
    var pageSize = that.data.pageSize
    app.Util.ajax('mall/home/bestChoice', {
      pageNumber: pageNumber,
      pageSize: pageSize
    }, 'GET').then((res) => { // 使用ajax函数
      if (res.messageCode = 'MSG_1001') {
        res.data.content.items.forEach((v, i) => {
          v.truePrice = parseFloat((v.dctPrice - v.marketingCashBack.totalAmount).toFixed(2))
        })
        that.setData({
          list: res.data.content.items
        })
      }
    })
  },
  //加载更多好货
  getMore2: function() {
    var that = this
    var pageNumber = that.data.pageNumber + 1
    app.Util.ajax('mall/home/bestChoice', {
      pageNumber: pageNumber,
      pageSize: that.data.pageSize
    }, 'GET').then((res) => { // 使用ajax函数
      if (res.data.content) {
        if (res.data.content.items == '' && that.data.list !== '') {
          that.setData({
            text1: '已到底，去【寻商品】提交吧'
          })
        }
        var arr = that.data.list
        res.data.content.items.forEach((v, i) => {
          v.truePrice = parseFloat((v.dctPrice - v.marketingCashBack.totalAmount).toFixed(2))
          arr.push(res.data.content.items[i])
        })
        that.setData({
          list: arr,
          pageNumber: pageNumber
        })
      }
    })
  },
  //页面初始化全部订单
  initgetMore1: function() {
    var that = this
    var pageNumber = that.data.pageNumber
    var latestStatus = that.data.currentTab ? that.data.currentTab : ''
    app.Util.ajax('mall/order/queryOrderListByUserId', {
      pageNumber: pageNumber,
      pageSize: that.data.pageSize,
      latestStatus: latestStatus
    }, 'GET').then((res) => { // 使用ajax函数
      if (res.data.content) {
        that.setData({
          allOrder: res.data.content.items
        })
        that.init()
      }
    })
  },
  //加载更多订单
  getMore1: function() {
    var that = this
    var pageNumber = that.data.pageNumber + 1
    if (that.data.status == 0) {
      that.setData({
        status: ''
      })
    }
    app.Util.ajax('mall/order/queryOrderListByUserId', {
      pageNumber: pageNumber,
      pageSize: that.data.pageSize,
      latestStatus: that.data.status
    }, 'GET').then((res) => { // 使用ajax函数
      if (res.data.content) {
        if (res.data.content.items == '' && that.data.allOrder !== '') {
          that.setData({
            text: '已到底，去【寻商品】提交吧'
          })
        }
        var arr = that.data.allOrder
        for (var i = 0; i < res.data.content.items.length; i++) {
          arr.push(res.data.content.items[i])
        }
        that.setData({
          allOrder: arr,
          pageNumber: pageNumber
        })
      }
    })
  },
   //加载退款商品
   getMore3: function() {
    var that = this
    var pageNumber1 = that.data.pageNumber1 + 1
    if (that.data.status == 0) {
      that.setData({
        status: ''
      })
    }
    app.Util.ajax('mall/orderRefund/queryRefundOrderList', {
      pageNumber: pageNumber1,
      pageSize: that.data.pageSize
    }, 'GET').then((res) => { // 使用ajax函数
      if (res.data.content) {
        if (res.data.content.items == '' && that.data.returnOrder !== '') {
          that.setData({
            text: '已到底，去【寻商品】提交吧'
          })
        }
        var arr = that.data.returnOrder
        for (var i = 0; i < res.data.content.items.length; i++) {
          arr.push(res.data.content.items[i])
        }
        that.setData({
          returnOrder: arr,
          pageNumber1: pageNumber1
        })
      }
    })
  },
  //终止0元购按钮
  stopZero: function(e) {
    var that = this
    console.log(e)
    that.setData({
      whetherAdvanceSale:e.currentTarget.dataset.whetheradvancesale,
      latestStatus:e.currentTarget.dataset.lateststatus
    })
    if(e.currentTarget.dataset.isstop==2){
      console.log("已置灰")
    }else{
      app.Util.ajax('mall/order/queryStopApplyZeroPurchase', {
        orderId: e.currentTarget.dataset.orderid
      }, 'GET').then((res) => {
        if(res.data.messageCode=="MSG_1001"){
          that.setData({
            refundAmount: res.data.content.refundAmount,
            orderId: e.currentTarget.dataset.orderid,
            seedAmountTotal:res.data.content.seedAmountTotal,
            seedAmountConsume:res.data.content.seedAmountConsume,
            seedStatus:res.data.content.status,
            isStop:res.data.content.isStop
          })
          that.setData({
            seedToast: true
          })
        }else{
          wx.showToast({
            title:res.data.message,
            icon:"none"
          })
        }
      })
    }
  },
  //去付款按钮
  toPay: function(e) {
    var that = this
    var orderId = e.currentTarget.dataset.orderid
    var id = e.currentTarget.dataset.id
    var orderType = e.currentTarget.dataset.ordertype
    var advancesalestatus = e.currentTarget.dataset.advancesalestatus
    var defaultamountstatus =  e.currentTarget.dataset.defaultamountstatus
    that.setData({
      orderId:orderId,
      id:id,
      orderType:orderType
    })
    if(advancesalestatus==1&&defaultamountstatus==2){
      that.setData({
        payStatus:true
      })
    } else if (orderType == 23 || orderType == 24 || orderType == 26){
      wx.navigateTo({
        url: `/pages/paymentorder/paymentorder?orderId=${orderId}&id=${id}&orderType=${orderType}&takeType=${1}`,
      })
    }else{
      //预售返现卖方付尾款提示 orderSell
      wx.navigateTo({
        url: `/pages/paymentorder/paymentorder?orderId=${orderId}&id=${id}&orderType=${orderType}&orderSell=1`,
      })
    }
  },
  toPay2:function(){
    wx.navigateTo({
      url: '/pages/paymentorder/paymentorder?orderId='+this.data.orderId+'&id='+this.data.id+'&orderType='+this.data.orderType,
    })
    this.closePay()
  },
  closePay:function(){
    this.setData({
      payStatus:false
    })
  },
  //提醒卖家发货
  getMessage:function(){
    wx.showToast({
      title: '提醒卖家及时发货消息发送成功。',
      icon:'none'
    })
  },
  //确认收货
  confirmReceipt: function(e) {
    var that = this
    that.setData({
      showDialog: true,
      refundorderId: e.currentTarget.dataset.orderid
    })
  },
  cancel: function() {
    var that = this
    that.setData({
      showDialog: false
    })
  },
  allow: function(e) {
    var that = this
    var orderId = that.data.refundorderId
    app.Util.ajax('mall/order/confirmReceipt', {
      orderId: orderId
    }, 'POST').then((res) => { // 使用ajax函数
      if (res.data.content) {
        that.setData({
          pageNumber: 1
        })
        that.initgetMore1()
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
    that.setData({
      showDialog: false
    })
  },
  //取消退款
  cancelRefund: function(e) {
    var that = this
    that.setData({
      showDialog1: true,
      refundorderId: e.currentTarget.dataset.orderid
    })
  },
  cancelrefund: function() {
    var that = this
    that.setData({
      showDialog1: false
    })
  },
  surerefund: function(e) {
    var that = this
    var orderId = that.data.refundorderId
    app.Util.ajax('mall/order/cancelRefund', {
      orderId: orderId
    }, 'POST').then((res) => { // 使用ajax函数
      if (res.data.content) {
        that.setData({
          pageNumber: 1
        })
        that.initgetMore1()
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
    that.setData({
      showDialog1: false
    })
  },
  //退款
  refund: function(e) {
    var that = this
    that.setData({
      showDialog2: true,
      refundorderId: e.currentTarget.dataset.orderid
    })
  },
  refundDialog: function() {
    var that = this
    that.setData({
      showDialog2: false
    })
  },
  application: function(e) {
    var that = this
    var orderId = that.data.refundorderId
    var desc = that.data.reason
    app.Util.ajax('mall/order/applyRefund', {
      orderId: orderId,
      desc: desc
    }, 'POST').then((res) => { // 使用ajax函数
      if (res.data.content) {
        that.setData({
          pageNumber: 1
        })
        that.initgetMore1()
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
    that.setData({
      showDialog2: false
    })
  },
  //获取退款理由
  getText: function(e) {
    var that = this
    var current = e.currentTarget.dataset.current
    var reason = e.currentTarget.dataset.text
    that.setData({
      current: current,
      reason: reason
    })
  },
  //取消订单
  cancelOrder: function(e) {
    var that = this
    that.setData({
      showDialog3: true,
      refundorderId: e.currentTarget.dataset.orderid,
      defaultAmountStatus:e.currentTarget.dataset.defaultamountstatus,
      whetherAdvanceSale:e.currentTarget.dataset.whetheradvancesale,
      defaultAmount:e.currentTarget.dataset.defaultamount,
      advanceSaleStatus:e.currentTarget.dataset.advancesalestatus
    })
  },
  cancelorder: function() {
    var that = this
    that.setData({
      showDialog3: false
    })
  },
  sureorder: function(e) {
    var that = this
    var orderId = that.data.refundorderId
    var desc = that.data.reason1
    app.Util.ajax('mall/order/cancelOrder', {
      orderId: orderId,
      desc: desc
    }, 'POST').then((res) => { // 使用ajax函数
      if (res.data.content) {
        that.setData({
          pageNumber: 1
        })
        that.initgetMore1()
        that.setData({
          showDialog3: false
        })
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //获取退款理由
  getText1: function(e) {
    var that = this
    var current = e.currentTarget.dataset.current
    var reason = e.currentTarget.dataset.text
    that.setData({
      current: current,
      reason1: reason
    })
  },
  //去评价
  toEvaluate: function(e) {
    var that = this
    wx.navigateTo({
      url: '/pages/goodsComment/goodsComment?orderid=' + e.currentTarget.dataset.orderid
    })
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
    var that = this
    that.setData({
      pageNumber: 1
    })
    that.initgetMore1()
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
    var pages = getCurrentPages()
    // 如果是从提交订单页面跳转过来 页面返回的时候跳转到我的页面
    if (wx.getStorageSync('tempStatus') || wx.getStorageSync('params') || wx.getStorageSync('takeType') || wx.getStorageSync('returnToSponsor') || wx.getStorageSync('myOrder')) {
      
    } else {
      wx.switchTab({
        url: '/pages/mine/mine'
      })
    }
    wx.removeStorageSync('tempStatus')
    wx.removeStorageSync('params')
    wx.removeStorageSync('returnToSponsor')
    wx.removeStorageSync('myOrder')
    wx.removeStorageSync('takeType')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    if(!that.data.orderShowStatus){
      that.getMore3()
    }else{
      if (that.data.allOrder.length > 2) {
        that.getMore1()
      } else {
        that.getMore2()
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      path: "/pages/myorder/myorder?inviterCode=" + wx.getStorageSync('inviterCode'),
    }
  },
  tab: function(e) {
    var that = this;
    var status = e.currentTarget.dataset.status
    if(e.currentTarget.dataset.current==5){
      for (var i in that.data.orderTabItem) {
        that.setData({
          [`orderTabItem[${i}].select`]: false
        });
      }
      that.setData({
        [`orderTabItem[${e.currentTarget.dataset.current}].select`]: true,
        orderShowStatus:false,
        returnShowStatus:true
      });
      app.Util.ajax('mall/orderRefund/queryRefundOrderList', {
        pageNumber: 1,
        pageSize: 20
      }, 'GET').then((res) => { // 使用ajax函数
        if (res.data.content) {
          that.setData({
            returnOrder:res.data.content.items
          })
        }
      })
    }else{
      that.setData({
        pageNumber: 1,
        allOrder:[],
        list:[],
        status: status,
        orderShowStatus:true
      })
      if (status == 0) {
        that.setData({
          currentTab: ''
        })
        that.initgetMore1()
      } else {
        that.setData({
          currentTab: status
        })
        app.Util.ajax('mall/order/queryOrderListByUserId', {
          pageNumber: 1,
          pageSize: 20,
          latestStatus: status
        }, 'GET').then((res) => { // 使用ajax函数
          if (res.data.content) {
            that.setData({
              allOrder: res.data.content.items
            })
            that.init();
          }
        })
      }     
      for (var i in that.data.orderTabItem) {
        that.setData({
          [`orderTabItem[${i}].select`]: false
        });
      }
      that.setData({
        [`orderTabItem[${e.currentTarget.dataset.current}].select`]: true
      });
    }
  },
  comfireCancel: function(e) {
    var that = this
    var latestStatus = that.data.latestStatus
    var whetherAdvanceSale = that.data.whetherAdvanceSale
    let isStop = that.data.isStop
    console.log(latestStatus,whetherAdvanceSale)
    app.Util.ajax('mall/order/queryOrder', {
      orderId: that.data.orderId
    }, 'GET').then((res) => {
      if (!isStop) {
        //订单内有多个商品，进入返现明细
        wx.navigateTo({
          url: `/pages/cashBack/cashBack?orderId=${that.data.orderId}&latestStatus=${latestStatus}&whetherAdvanceSale=${whetherAdvanceSale}`
        })
        this.setData({
          seedToast:false
        })
      } else {
        //订单内只有单个商品，直接终止
        app.Util.ajax('mall/order/stopApplyZeroPurchase', {
          orderId: that.data.orderId
        }, 'POST').then((res) => {
          if (res.data.messageCode == "MSG_1001") {
            wx.showToast({
              title: '终止成功,钱款已进入余额,可随时体现哦!',
              icon: "none",
              during: 2000
            })
            setTimeout(function() {
              that.setData({
                pageNumber: 1
              })
              that.initgetMore1()
            }, 2000) //延迟时间 这里是1秒
            that.setData({
              seedToast: false
            })
          } else {
            wx.showToast({
              title: '终止失败,请稍后再试',
              icon: 'none'
            })
          }

        })
      }
    })
  },
  toDealWith:function(e){
      wx.navigateTo({
        url:"/packageA/pages/dealWithReturn/dealWithReturn?goodsId="+e.currentTarget.dataset.id
      })
  },
  cancelPreSell:function(e){
    var advanceSaleStatus = e.currentTarget.dataset.advancesalestatus
    var orderId = e.currentTarget.dataset.orderid
    if(advanceSaleStatus==1){
      //订单未预订
      this.setData({
        sellOneStatus:true,
        orderId:orderId
      })
    }else if(advanceSaleStatus==2){
      //订单已预订
      this.setData({
        sellTwoStatus:true,
        orderId:orderId
      })
    }
  },
  shureCanclePre:function(){
    var that = this
    that.setData({
      sellTwoStatus:false,
      sellOneStatus:false,
      pageNumber: 1
    })
    app.Util.ajax('mall/order/cancelOrderAdvanceSale', {
      orderId: that.data.orderId
    }, 'POST').then((res) => {
      if(res.data.messageCode=="MSG_1001"){
        wx.showToast({
          title: '撤销成功',
          icon: 'none'
        })
        setTimeout(function() {
          that.initgetMore1()
        }, 500)
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  cancle:function(){
    this.setData({
      seedToast:false
    })
  },
  toSeed:function(){
    wx.navigateTo({
      url:"/packageA/pages/seed/seed"
    })
    this.setData({
      seedToast:false
    })
  },
})