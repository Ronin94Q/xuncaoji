// packageB/pages/onlineActivityDetail/onlineActivityDetail.js
const app = getApp()
var util = require('../../../utils/util.js');
var time = require('../../../utils/util.js');
var selectAttrid = []; //选择的属性id
var count = true //节流阀-限制购买提交次数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current:0,
    hostUrl: app.Util.getUrlImg().hostUrl,
    autoplay: true,
    circular: true,
    interval: 2000,
    duration: 1000,
    showModalStatus:false,
    buyMode:1,
    num:1,
    minusStatus: 'disabled',
    plusStatus: 'disabled',
    cashMoney: '', //将返现金额
    selectAttridstr: '',
    pageNumber: 1,
    pageSize: 20,
    haibao:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      // goodsId: parseInt(options.id) || wx.getStorageSync('goods_id'),
      goodsId:27 || wx.getStorageSync('goods_id'),
      inviterCode: options.inviterCode || '',
      options: options
    })
    if (options) {
      //添加商品id缓存
      wx.setStorage({
        key: "goods_id",
        data: parseInt(options.id)
      })
    }
    this.getGoodsData()
    //查询分享数据
    that.chooseShare();
  },
  getGoodsData: function() {
    let that = this
    app.Util.ajax('mall/home/goodsDetail', {
      id: that.data.goodsId
    }, 'GET').then((res) => {
      if (res.data.messageCode == "MSG_1001") {
        var saveAmount = ((res.data.content.orgPrice) - (res.data.content.dctPrice)).toFixed(2)
        that.setData({
          commodity: res.data.content.activityItem ? res.data.content.activityItem.activityId : null,
          imageUrls: res.data.content.imageUrls,
          detail: res.data.content,
          competitorPrices: res.data.content.competitorPrices.length > 0 ? res.data.content.competitorPrices : [],
          store: res.data.content.store,
          spec: res.data.content.specs,
          introductions: res.data.content.introductions,
          stockDetail: res.data.content.stockDetail,
          saveAmount: saveAmount,
          saveMoney: res.data.content.cashBack ? (parseFloat(saveAmount) + parseFloat(res.data.content.cashBack.totalAmount)).toFixed(2) : '',
        })
          for (var i = 0; i < that.data.spec.length; i++) {
            let items = that.data.spec[i].items
            items[0]['isSelect'] = true
          }
          var name = [];
          for (var a = 0; a < that.data.spec.length; a++) {
            for (var b = 0; b < that.data.spec[a].items.length; b++) {
              if (that.data.spec[a].items[b].isSelect == true) {
                name.push(that.data.spec[a].items[b].name)
                that.setData({
                  selectNameArr: name,
                  selectName: name.join('/')
                })
              }
            }
          }
          that.setData({
            spec: that.data.spec,
            iconUrl: res.data.content.specs[0].items[0].iconUrl,
          })
          var spec = that.data.spec
          var size = spec.length;
          var index = 0;
          var selectAttridstr1 = []
          for (var i = 0; i < size; i++) {
            selectAttridstr1.push(spec[i].items[0].id)
          }
          that.setData({
            selectAttridStr: selectAttridstr1,
          });
          for (let i in that.data.stockDetail) {
            var selectAttridStr = that.data.selectAttridStr
            that.data.stockDetail[i].dctPrice = parseFloat((that.data.stockDetail[i].dctPrice).toFixed(2))
            if (selectAttridStr == i) {
              that.setData({
                stockDetail1: that.data.stockDetail[i],
                quantity: that.data.stockDetail[i].quantity,
                cashMoney: that.data.stockDetail[i].cashbackItems ? that.data.stockDetail[i].cashbackItems[0].totalAmount : '',
                cashbackId: that.data.stockDetail[i].cashbackItems ? that.data.stockDetail[i].cashbackItems[0].cashbackId : '',
                activeIndex: 0
              })
            }
          }
      } else if (res.data.messageCode == "MSG_4002") {
        that.setData({
          xiajia: true
        })
      } else {
        wx.showToast({
          title: res.data.message,
          icon: "none"
        })
      }
    })
  },
   //求当前轮播图的索引
   countIndex: function(e) {
    this.setData({
      current: e.detail.current
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
    let that = this
    that.comment()
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
    //显示对话框
    showModal: function() {
      // 显示遮罩层
      var that = this
      that.setData({
        showModalStatus: true,
      })
    },
    //隐藏规格对话框
    hideModal: function() {
      // 隐藏遮罩层
      var that = this
      that.setData({
        showModalStatus: false,
        zero: false,
        buyMode: 1,
        isOrder: false
      })
      app.globalData.isShowBook = 1
    },
      //选中规格
  clickAttr: function(e) {
    var that = this

      var selectIndex = e.currentTarget.dataset.selectIndex; //选择大规格的id
      var attrIndex = e.currentTarget.dataset.attrIndex;
      var name = e.currentTarget.dataset.name;
      var spec = that.data.spec;
      var count = spec[selectIndex].items.length;
      that.data.selectNameArr[selectIndex] = e.currentTarget.dataset.name
      that.setData({
        selectName: that.data.selectNameArr.join('/'),
      })
      for (var i = 0; i < count; i++) {
        spec[selectIndex].items[i].isSelect = false;
      }
      spec[selectIndex].items[attrIndex].isSelect = true;
      if (spec[selectIndex].items[attrIndex].isSelect == true) {
        if (spec[selectIndex].items[attrIndex].iconUrl) {
          that.setData({
            iconUrl: spec[selectIndex].items[attrIndex].iconUrl
          })
        }
      }
      var attrid = spec[selectIndex].items[attrIndex].id;
      selectAttrid[selectIndex] = attrid;
      that.setData({
        spec: spec, //变换选择框,
        selectAttrid: e.currentTarget.dataset.attrId,
      })
      for (let i in that.data.stockDetail) {
        if (that.data.selectAttridStr == i) {
          that.setData({
            cashbackId: that.data.stockDetail[i].cashbackItems ? that.data.stockDetail[i].cashbackItems[0].cashbackId : ''
          })
        }
      
    }
  },
    //选择规格index值
    specIndex: function(e) {
      var that = this
        var index = e.currentTarget.dataset.index
        var selectAttridStr = that.data.selectAttridStr
        selectAttridStr[index] = that.data.selectAttrid
        if (!that.data.stockDetail[selectAttridStr]) {
          return;
        }
        // 计算当前商品返现金额
        that.setData({
          stockDetail1: that.data.stockDetail[selectAttridStr],
          quantity: that.data.stockDetail[selectAttridStr].quantity,
          cashMoney: that.data.stockDetail[selectAttridStr].cashbackItems ? that.data.stockDetail[selectAttridStr].cashbackItems[0].totalAmount : '',
          cashbackId: that.data.stockDetail[selectAttridStr].cashbackItems ? that.data.stockDetail[selectAttridStr].cashbackItems[0].cashbackId : '',
          activeIndex: 0
        })
    },
      /* 点击减号 */
  bindMinus: function() {
    var that = this
      var num = that.data.num;
      // 如果大于1时，才可以减
      if (num > 1) {
        num--;
      }else if (num <= 1) {
        wx.showToast({
          title: '不能再少了哟',
          icon: 'none'
        })
      }
      // 只有大于一件的时候，才能normal状态，否则disable状态
      var minusStatus = num <= 1 ? 'disabled' : 'normal';
      // 将数值与状态写回
      that.setData({
        num: num,
        minusStatus: minusStatus
      });
  },
  bindPlus: function() {
    var that = this
    var that = this
      var num = that.data.num;
      // 不作过多考虑自增1
      if (num >= that.data.quantity) {
        wx.showToast({
          title: '给别人留点吧',
          icon: 'none'
        })
      } else {
        num++;
      }
      // 只有大于一件的时候，才能normal状态，否则disable状态
      var minusStatus = num < 1 ? 'disabled' : 'normal';
      var plusStatus = (num >= that.data.quantity) ? 'disabled' : 'normal';
      // 将数值与状态写回
      that.setData({
        num: num,
        minusStatus: minusStatus,
        plusStatus: plusStatus
      });
  },
    //选中返现
    clickCashback: function(e) {
      var that = this
      var id = e.currentTarget.dataset.id
      var cur = e.currentTarget.dataset.gindex
      that.setData({
        cashbackId: id,
        activeIndex: cur,
        cashMoney: e.currentTarget.dataset.total
      })
    },
    buy:function(e){
      let that = this
      let index = e.currentTarget.dataset.index
      that.setData({
        buyMode:index
      })
      that.showModal()
    },
      // 跳转到提交订单
  toPlaceorder: function(e) {
    if (count) { // 节流阀 - 限制订单重复提交
      count = false
      let goodsId = e.currentTarget.dataset.goodsid
      let stockId = e.currentTarget.dataset.stockid
      let quantity = e.currentTarget.dataset.quantity
      let activityId = e.currentTarget.dataset.activityid ? e.currentTarget.dataset.activityid : ''
      let cashbackId = e.currentTarget.dataset.cashbackid ? e.currentTarget.dataset.cashbackid : ''
      let that = this
      if (this.data.quantity === 0) {
        wx.showToast({
          title: '所选商品库存为0不可购买',
          icon: 'none'
        })
      } else if (this.data.num > this.data.quantity) {
        wx.showToast({
          title: '已超出最大库存',
          icon: 'none'
        })
      } else if (this.data.num < 1) {
        wx.showToast({
          title: '不能再少了哟',
          icon: 'none'
        })
      } else if (isNaN(this.data.num)) {
        wx.showToast({
          title: '数量不能少于1',
          icon: 'none'
        })
        this.setData({
          num: 1
        })
      } else {
        if(that.data.buyMode==1){
          wx.navigateTo({
            url: `/pages/placeorder/placeorder?goodsId=${goodsId}&stockId=${stockId}&quantity=${quantity}&cashbackId=${cashbackId}`,
          })
        }else{
          wx.navigateTo({
            url: `/packageB/pages/applyZero/applyZero?goodsId=${goodsId}&stockId=${stockId}&quantity=${quantity}`,
          })
        }
      }
    }
    setTimeout(function() {
      count = true
    }, 1000)
  },
    // 商品评论
    comment: function() {
      var that = this
      app.Util.ajax('mall/interact/queryUserInteract', {
        pageNumber: that.data.pageNumber,
        pageSize: that.data.pageSize,
        goodsId: that.data.goodsId
      }, 'GET').then((res) => {
        if (res.data.messageCode == 'MSG_1001') {
          if (res.data.content.items.length > 0) {
            res.data.content.items[0].createTime = time.formatTimeTwo(res.data.content.items[0].createTime, 'Y-M-D h:m')
          }
          that.setData({
            goodInteractRate: res.data.content.goodInteractRate,
            comment: res.data.content.items
          })
        }
      })
    },
//跳转到评价页面
  jumpEvaluate: function(e) {
    var goodsId = e.currentTarget.dataset.goodsid
    wx.navigateTo({
      url: `/pages/evaluate/evaluate?goodsId=${goodsId}`
    })
  },
    //分享
    share: function(e) {
      var that = this
      var goodsId = e.currentTarget.dataset.goodsid
      var sharingProfit = e.currentTarget.dataset.profit ? e.currentTarget.dataset.profit : ''
      that.setData({
        goodsId: goodsId,
        sharingProfit: sharingProfit
      })
      that.setData({
        showModalStatus1: true
      })
    },
    cancelShare: function() {
      var that = this
      that.setData({
        showModalStatus1: false
      })
    },
     //查询分享数据
  chooseShare: function () {
    var that = this
      app.Util.ajax('mall/weChat/sharing/target', {
        mode: 1,
        targetId: that.data.goodsId
      }, 'GET').then((res) => {
        if (res.data.messageCode == "MSG_1001") {
          var inviterCode = wx.getStorageSync('inviterCode')
          if (inviterCode) {
            res.data.content.link = res.data.content.link.replace(/{inviterCode}/g, inviterCode)
          } else {
            res.data.content.link = res.data.content.link.replace(/{inviterCode}/g, '')
          }
          // 产品图片路径转换为本地路径
          var imageUrl = res.data.content.imageUrl
          if (imageUrl) {
            wx.getImageInfo({
              src: imageUrl,
              success(res) {
                var ctx = wx.createCanvasContext('canvas');
                var path_bg = res.path; //背景图片
                var path_logo = '/assets/images/icon/apply_icon.png'
                // 绘制产品图片
                ctx.drawImage(path_bg, 0, 0, 400, 400);
                //绘制申请0元购logo
                ctx.drawImage(path_logo, 240, 245, 130, 64);
                ctx.draw()
                setTimeout(function () {
                  wx.canvasToTempFilePath({
                    canvasId: 'canvas',
                    success: function (res) {
                      that.data.shareImg = res.tempFilePath
                    }
                  })
                }, 1000)
              }
            })
          }
          that.setData({
            shareList: res.data.content
          })
          that.getShareData();
        } else if (res.data.messageCode == "MSG_4002") {

        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 3000
          })
        }
      })
  },
  // 获取分享数据
  getShareData: function () {
    var that = this
    if (that.data.commodity || wx.getStorageSync("isCommodity")) {
      app.Util.ajax('mall/weChat/sharing/target', {
        mode: 15,
        targetId: that.data.goodsId,
        activityId: that.data.commodity,
      }, 'GET').then((res) => {
        if (res.data.messageCode = 'MSG_1001') {
          that.data.shareData = res.data.content
          // 产品图片路径转换为本地路径
          var imageUrl = res.data.content.imageUrl
          if (imageUrl) {
            wx.getImageInfo({
              src: imageUrl,
              success(res) {
                that.data.path_img = res.path
              }
            })
          }
          //邀请码转换为本地路径
          var appletQrCodeUrl = res.data.content.appletQrCodeUrl
          if (appletQrCodeUrl) {
            wx.getImageInfo({
              src: appletQrCodeUrl,
              success(res) {
                that.data.appletQrCodeUrl = res.path
              }
            })
          }
        }
      })
    } else {
      var mode;
      if (that.data.newPeopleActivity == 2 || wx.getStorageSync("isNewPeopleActivity")) {
        mode = 14
      } else {
        mode = 1
      }
      app.Util.ajax('mall/weChat/sharing/target', {
        mode: mode,
        targetId: that.data.goodsId,
      }, 'GET').then((res) => {
        if (res.data.messageCode = 'MSG_1001') {
          that.data.shareData = res.data.content
          // 产品图片路径转换为本地路径
          var imageUrl = res.data.content.imageUrl
          if (imageUrl) {
            wx.getImageInfo({
              src: imageUrl,
              success(res) {
                that.data.path_img = res.path
              }
            })
          }
          //邀请码转换为本地路径
          var appletQrCodeUrl = res.data.content.appletQrCodeUrl
          if (appletQrCodeUrl) {
            wx.getImageInfo({
              src: appletQrCodeUrl,
              success(res) {
                that.data.appletQrCodeUrl = res.path
              }
            })
          }
        }
      })
    }
  },
  // 分享到朋友圈
  shareFriend: function() {
    var that = this
    var width
    var height
    wx.getSystemInfo({
      success(res) {
        width = res.screenWidth
        height = res.screenHeight
      }
    })
    var ctx = wx.createCanvasContext('mycanvas');
    var path_bg = '/assets/images/icon/bg.png'; //背景图片
    var path_bg2 = '/assets/images/icon/canvas_title.png';
    var path_logo = '/assets/images/icon/xuncaoji_icon.png'
    var path_partner = '/assets/images/icon/partner.png'
    var title = that.data.shareList.title
    var inviterCode = that.data.shareData.inviterCode
    //绘制图片模板的背景图片
    ctx.drawImage(path_bg, 0, 0, 0.88 * width, 0.89 * height);
    //绘制红色背景
    ctx.drawImage(path_bg2, 0, 0, 0.885 * width, 0.224 * height);
    // 绘制标题
    ctx.setFontSize(13);
    ctx.setFillStyle('#fff');
    ctx.setTextAlign("center")
    ctx.fillText(title, 0.442 * width, 25);
    ctx.stroke();
    // 绘制中间矩形
    ctx.beginPath()
    ctx.setFillStyle('#fff')
    ctx.setShadow(0, 0, 2, '#eee')
    ctx.fillRect(0.057 * width, 0.08 * height, 0.76 * width, 0.522 * height - 2)
    ctx.closePath()
    //绘制合伙人图标
    ctx.beginPath()
    ctx.drawImage(path_partner, 0.35 * width, 44, 64, 51);
    ctx.closePath()
    // 绘制邀请码
    if (inviterCode) {
      ctx.beginPath()
      ctx.setFontSize(19);
      ctx.setFillStyle('#F85A53');
      ctx.fillText(`我的邀请码:${inviterCode}`, 0.442 * width, 120);
      ctx.stroke();
      ctx.closePath()
    }
    // 绘制最小矩形
    ctx.beginPath()
    ctx.setFillStyle('#fff')
    ctx.setShadow(0, 0, 2, '#eee')
    ctx.fillRect(0.1308 * width, 130, 0.617 * width, 0.3 * height)
    ctx.closePath()
    // 绘制商品图片
    ctx.beginPath()
    ctx.drawImage(that.data.path_img, 0.1308 * width + 7, 137, 0.617 * width - 14, 0.3 * height - 14);
    ctx.closePath()
    // 绘制已抢数量
    ctx.beginPath()
    var number = `已抢数量：${that.data.shareData.grabbed}`
    var textWidth = inviterCode ? ctx.measureText(number).width : ctx.measureText(number).width + 50
    ctx.setFillStyle('#F5BA2C');
    ctx.moveTo(0.1308 * width, 174)
    ctx.lineTo(0.1308 * width, 180)
    ctx.lineTo(0.1308 * width - 10, 174)
    ctx.lineTo(0.1308 * width - 10, 150)
    ctx.lineTo(0.1308 * width + textWidth / 2 + 22, 150)
    ctx.lineTo(0.1308 * width + textWidth / 2 + 22, 174)
    ctx.lineTo(0.1308 * width - 10, 174)
    ctx.arc(0.1308 * width + textWidth / 2 + 22, 162, 12, 1.5 * Math.PI, 0.5 * Math.PI, false)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.setFontSize(12);
    ctx.setFillStyle('#fff');
    ctx.setTextAlign("left")
    ctx.fillText(number, 0.1308 * width, 167);
    ctx.closePath()
    ctx.stroke();
    // 绘制0元购图标
    var path_zero = "/assets/images/icon/apply free.png"
    ctx.beginPath()
    ctx.drawImage(path_zero, 0.52 * width, 0.36 * height, 0.2 * width, 0.2 * width);
    ctx.closePath()
    // 绘制价格
    ctx.beginPath()
    var price = `一折购¥${that.data.shareData.price}`
    ctx.setFontSize(16);
    ctx.setFillStyle('#F85A53');
    ctx.setTextAlign("left")
    ctx.fillText(price, 0.1308 * width, 0.525 * height - 4);
    ctx.stroke();
    ctx.closePath()
    ctx.beginPath()
    // 绘制参与返
    ctx.setFillStyle('#F85A53');
    ctx.setStrokeStyle('#F85A53')
    var textWidth = ctx.measureText(`最高返¥ ${that.data.shareData.cashBack}`).width
    var textWidth2 = ctx.measureText(price).width
    ctx.moveTo(0.1 * width + textWidth2 + 24 - 6, 0.525 * height - 8)
    ctx.lineTo(0.1 * width + textWidth2 + 24, 0.525 * height - 12)
    ctx.lineTo(0.1 * width + textWidth2 + 24, 0.525 * height - 20)
    ctx.lineTo(0.1 * width + textWidth2 + 24 + textWidth / 2 + 32, 0.525 * height - 20)
    ctx.lineTo(0.1 * width + textWidth2 + 24 + textWidth / 2 + 32, 0.525 * height + 4)
    ctx.lineTo(0.1 * width + textWidth2 + 24, 0.525 * height + 4)
    ctx.lineTo(0.1 * width + textWidth2 + 24, 0.525 * height - 2)
    ctx.lineTo(0.1 * width + textWidth2 + 24 - 6, 0.525 * height - 8)
    ctx.closePath()
    ctx.fill()
    // 绘制参与返价格
    var cashBack = `最高返¥ ${that.data.shareData.cashBack}`
    ctx.beginPath()
    ctx.setFontSize(12);
    ctx.setFillStyle('#fff');
    ctx.setTextAlign("left")
    ctx.fillText(cashBack, 0.1 * width + textWidth2 + 28, 0.525 * height - 4);
    ctx.stroke();
    ctx.closePath()
    // 绘制广告语
    ctx.beginPath()
    var adTips = that.data.shareList.imageDesc
    ctx.setFontSize(14);
    ctx.setFillStyle('#333333');
    ctx.setTextAlign("left")
    let chr = adTips.split('') // 分割为字符串数组
    let temp = ''
    let row = []
    for (let a = 0; a < chr.length; a++) {
      if (ctx.measureText(temp).width < 0.65 * width) {
        temp += chr[a]
      } else {
        a--
        row.push(temp)
        temp = ''
      }
    }
    row.push(temp)
    for (var b = 0; b < row.length; b++) {
      ctx.fillText(row[b], 0.1308 * width - 6, 0.565 * height - 4 + b * 20);
    }
    ctx.stroke();
    ctx.closePath()
    // 绘制二维码
    ctx.setShadow(0, 0, 0, '#fff')
    ctx.beginPath()
    ctx.drawImage(that.data.appletQrCodeUrl, 0.3 * width, 0.6075 * height - 2, 0.3 * width, 0.3 * width);
    ctx.closePath()
    // 绘制扫码提示
    ctx.beginPath()
    var codeTips = '长按图片识别二维码查看领取'
    ctx.setFontSize(12);
    ctx.setFillStyle('#999999');
    ctx.setTextAlign("center")
    ctx.fillText(codeTips, 0.44 * width, 0.787 * height - 2);
    ctx.stroke();
    ctx.closePath()
    ctx.draw()
    setTimeout(function() {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function(res) {
          that.data.haibaoImg = res.tempFilePath
        }
      })
    }, 1000)
    that.setData({
      showModalStatus1: false,
      haibao: true
    })
  },
  // 长按保存到相册
  handleLongPress: function() {
    var that = this
    var tempFilePath = that.data.haibaoImg
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log('授权相册')
              wx.saveImageToPhotosAlbum({
                filePath: tempFilePath,
                success(res) {
                  wx.hideLoading()
                  console.log('保存图片成功回调')
                  wx.showToast({
                    title: '保存成功',
                    icon: 'none'
                  });
                  that.setData({
                    haibao: false
                  })
                },
                fail(res) {
                  wx.hideLoading()
                  console.log('保存图片失败回调')
                  console.log(res);
                }
              })
            },
            fail() {
              wx.hideLoading();
              wx.showModal({
                title: '温馨提示',
                content: '您已拒绝授权，是否去设置打开？',
                confirmText: "确认",
                cancelText: "取消",
                success: function(res) {
                  console.log(res);
                  if (res.confirm) {
                    console.log('用户点击确认')
                    wx.openSetting({
                      success: (res) => {
                        console.log(res)
                        res.authSetting = {
                          "scope.writePhotosAlbum": true,
                        }
                        console.log("openSetting: success");
                        wx.saveImageToPhotosAlbum({
                          filePath: tempFilePath,
                          success(res) {
                            wx.hideLoading()
                            wx.showToast({
                              title: '保存成功',
                              icon: 'none'
                            });
                            that.setData({
                              haibao: false
                            })
                          },
                          fail(res) {
                            wx.hideLoading()
                            console.log(res);
                          }
                        })
                      }
                    });
                  } else {
                    console.log('用户点击取消')
                  }
                }
              });

            }
          })
        } else {
          console.log('保存图片')
          wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success(res) {
              wx.hideLoading()
              console.log('保存图片成功回调')
              wx.showToast({
                title: '保存成功',
                icon: 'none'
              });

              that.setData({
                haibao: false
              })
            },
            fail(res) {
              wx.hideLoading()
              console.log('saveImageToPhotosAlbum 失败回调')
              console.log(res);
            }
          })
        }
      },
      fail(res) {
        wx.hideLoading()
        console.log('wx.getSetting 失败回调')
        console.log(res);
      }
    })

  },
  // 关闭海报分享页面
  close_hb: function() {
    var that = this
    that.setData({
      haibao: false
    })
  },
})