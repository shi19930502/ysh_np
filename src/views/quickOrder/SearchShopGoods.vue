<template>
	<yd-layout id="SearchShopGoods">
		<div slot='top' class="search_input search_input_popup gradient search_input_children_fixed">
			<input class="search_input_children " ref='searchRef' type="text" placeholder="搜索商品" v-model='searchInputVal' />
			<div class="close_popup" @click="cancle">关闭</div>
		</div>
		<yd-pullrefresh :callback="loadList" ref="pullrefreshDemo">
			<yd-infinitescroll :callback="getProductList" ref="productListsearch">
				<ul class="product-list" v-if="productList.length>0" slot="list">
					<li class="flex flex-y-center flex-x-between" v-for="(d,index) in productList">
						<div class="flex" style="width: 100%;">
							<div class="imgwarp">
								<img v-if="d.isCollection==0&&$root.userInfo.typeId=='buyer'" src="../../assets/imgs/sc-icon.png" class="scpic" @click="createProductcollection(d,index,productList)">
								<img v-if="d.isCollection==1&&$root.userInfo.typeId=='buyer'" src="../../assets/imgs/sc-icon_a.png" class="scpic" @click="createProductcollection(d,index,productList)">
								<img class="goodpic" v-if="d.skuPicUrl" :src="imgURL+d.skuPicUrl" alt="">
								<img class="goodpic" v-else src="../../assets/imgs/img_moren@2x.png">
								<!--<div v-if="d.canUseQuantity<0" class="quehuo-s flex flex-x-center flex-y-center">
												<span>缺货</span>
											</div>-->
							</div>
							<div class="info">
								<h1 v-if="d.proMeasureName != d.skuMeasureName">{{d.productName+'-'+d.name+'['+d.skuWeight+d.proMeasureName+'/'+d.skuMeasureName+']'}}</h1>
								<h1 v-else>{{d.productName+'-'+d.name+'['+d.proMeasureName+']'}}</h1>

								<p v-if="d.remark" style="padding: 3px;">
									<template v-if="d.remark.length>6">{{d.remark.substring(0,6)+'...'}}</template>
									<template v-else>{{d.remark}}</template>
								</p>
								<p v-else style="padding: 3px 0;">暂无描述</p>
								<p style="padding: 0;">{{d.stockLimit == '0' ? '库存充足' : d.canUseQuantity>0 ? '库存量:'+d.canUseQuantity/100 : '库存较少'}}</p>
								<p style="padding: 3px 0;" v-if='d.skuMethodType==1'>计量方式:计重</p>
								<p style="padding: 3px 0;" v-else-if='d.skuMethodType==2'>计量方式:计件</p>
								<template v-if="d.promotionPrice < d.price">
									<span class="active-status">促销</span>
									<span style="text-decoration: line-through;color: #797D77;">{{'￥'+d.price+' / '+d.skuMeasureName}}</span><span class="name_4_span"></span>
								</template>
								<h3 v-if='d.isActualPrice==1&&d.isActualPrice!=null'>时价</h3>
								<div v-else>
									<h3 v-if="d.promotionPrice>0 && d.promotionBasePrice>0">{{'￥'+d.promotionPrice}} <span class="name_4_span">/ {{d.skuMeasureName}}</span></h3>
									<h3 v-else>{{'￥'+d.price}}</h3>
								</div>

								<div class="caigou_icon">
									<div class="flex flex-y-center">
										<template v-if="d.quantity>0 || d.quantity===''">
											<div @click="countQuantity(d,index,0)">
												<img src="../../assets/imgs/caigou_icon_jian.png">
											</div>
											<yd-input :on-focus='focusSelectAll' @change.native="countQuantity(d,index,2)" v-model="d.quantity" max="6" type="number" :show-success-icon="false" :show-clear-icon="false" class="quantity-input"></yd-input>
										</template>
										<div @click="countQuantity(d,index,1)">
											<img src="../../assets/imgs/caigou_icon_add.png">
										</div>
									</div>
								</div>
							</div>
						</div>
						<!--v-if="(d.stockLimit==1 &&  d.canUseQuantity>0) || d.stockLimit==0"-->

					</li>
				</ul>
				<span slot="doneTip">没有更多商品啦~~</span>
			</yd-infinitescroll>
		</yd-pullrefresh>
	</yd-layout>
</template>

<script>
	import configs from '../../configs'
	export default {
		data() {
			return {
				productList: [],
				searchInputVal: '',
				imgURL: configs.imgURL,
				pageNum: 1,
				pageSize: 10,
				cancelList: [],
			}
		},
		watch: {
			searchInputVal(val) {
				this.productList = []
				this.cancelList = []
				this.pageNum = 1
				this.$refs.productListsearch.$emit('ydui.infinitescroll.reInit');
				this.getQueryGrouplist()

			}
		},
		created() {
			this.$store.dispatch('changeNavBarTitle', '店铺内搜索商品')
			this.getCustomerById()
		},
		mounted() {
			this.getQueryGrouplist()
		},
		methods: {
			getCustomerById() {
				this.postRequest('customer/queryById', {
					id: this.$route.query.sellerId
				}).then(resp => {
					if(resp.data && resp.data.state == 0) {
						// 获取供应商信息
						if(resp.data.aaData) {
							this.sellerInfo = resp.data.aaData
						}
					}
				})
			},
			//当点击取消收藏就，在收藏就会执行。删除记录的取消收藏
			cancelListDel(d) {
				for(let a = 0; a < this.cancelList.length; a++) {
					if(this.cancelList[a].id == d.id) {
						this.cancelList.splice(a, 1)
						break
					}
				}
				console.log(this.cancelList)
			},
			/**
			 * 收藏商品
			 */
			createProductcollection(item, index, arr) {
				console.log(item)
				if(item.isCollection == 0) {
					var param = {
						customerId: this.$root.userInfo.typeCode - 0,
						sellerId: this.$route.query.sellerId,
						sellerName: this.sellerInfo.name,
						productId: item.productId,
						productName: item.productName,
						skuId: item.skuId ? item.skuId : item.id,
						skuName: item.name,
					}
					this.postRequest('Productcollection/create', param).then(d => {
						if(d.data && d.data.state == 0) {
							this.$dialog.toast({
								mes: '收藏成功',
								timeout: 1200,
								icon: 'success',
								callback: () => {
									//									this.getProductList(this.searchValue)
									if(this.cancelList.length > 0) {
										this.cancelListDel(item)
									}
									this.$set(arr[index], 'isCollection', 1)
								}
							});
						} else {
							if(d.data.msg == '已收藏的记录！') {
								this.$set(arr[index], 'isCollection', 1)
								this.$dialog.toast({
									mes: '该商品已被收藏过了，推荐刷新页面查看商品状态！',
									timeout: 1500
								});
							} else {
								this.$dialog.alert({
									mes: d.data.msg
								})
							}
						}
					})
				} else {
					this.postRequest('productcollection/deleteByCustomerIdAndSkuId', {
						customerId: this.$root.userInfo.typeCode - 0,
						skuId: item.skuId ? item.skuId : item.id,
					}).then(d => {
						if(d.data && d.data.state == 0) {
							this.$dialog.toast({
								mes: '取消收藏',
								timeout: 1200,
								icon: 'success',
								callback: () => {
									//									this.getProductList(this.searchValue)
									this.$set(arr[index], 'isCollection', 0)
									this.cancelList.push(item)
									console.log(this.cancelList)
								}
							});
						} else {
							if(d.data.msg == '没有要删除的记录！') {
								this.$dialog.toast({
									mes: '该商品已被取消收藏，推荐刷新页面查看商品状态！',
									timeout: 1500
								});
								this.$set(arr[index], 'isCollection', 0)
							} else {
								this.$dialog.alert({
									mes: d.data.msg
								})
							}
						}
					})
				}
			},
			//进入选中所有
			focusSelectAll(t) {
				t.target.select();
			},
			cancle() {
				this.$router.push({
					name: 'Merchant',
					query: {
						sellerId: this.$route.query.sellerId
					}
				})
			},
			/**
			 * 请求购物车数据
			 */
			getQueryGrouplist(flg) {
				this.postRequest('shippingcar/queryGrouplist', {
					buyerId: this.$root.userInfo.typeCode,
				}).then(resp => {
					if(resp.data && resp.data.state == 0) {
						var shopNum = 0;
						this.queryGrouplist = [];
						for(var key in resp.data.aaData) {
							shopNum++
							this.queryGrouplist = this.queryGrouplist.concat(resp.data.aaData[key])
						}
						this.addQuantity(this.productList, this.queryGrouplist)
						if(!flg) {
							this.getProductList()
						}

					}
				})
			},
			/**
			 * 添加和减少商品数量
			 */
			//0为减，1为加
			countQuantity(d, index, flgNum, allFlg) {
				var param = {};
				var url = '';
				param = {
					buyerId: this.$root.userInfo.typeCode,
					productId: d.productId,
					productName: d.productName,
					skuId: d.skuId ? d.skuId : d.id,
					skuName: d.name,
					quantity: 1,
					comment: '',
					sellerId: this.$route.query.sellerId,
				}

				if(d.quantity && d.quantity >= 0) {
					url = 'shippingcar/update'
					d.skuMethodType == 1 ? d.quantity = parseFloat(d.quantity).toFixed(2) : this.$set(d, 'quantity', parseInt(parseFloat(d.quantity)))
					if(flgNum == 1 && d.quantity < 9999) {
						d.quantity = d.skuMethodType == 1 ? (parseFloat(d.quantity) + 1).toFixed(2) : parseInt(d.quantity + 1);
					} else if(flgNum == 0) {
						d.quantity = d.skuMethodType == 1 ? (parseFloat(d.quantity) - 1).toFixed(2) : parseInt(d.quantity - 1);
					}else if(d.quantity==9999&&flgNum!=2){
						this.$dialog.toast({
		                    mes: '下单量不能超过9999！',
		                    timeout: 1500
		               });
					}
					d.quantity <= 0 ? d.quantity = null : d.quantity = d.quantity
					if(d.quantity == null) {
						url = 'shippingcar/delete'
					}
					param.quantity = d.quantity
					Object.assign(param, { id: d.gwcId })
				} else if(flgNum == 2) {
					d.skuMethodType == 1 ? d.quantity = d.quantity : this.$set(d, 'quantity', parseInt(parseFloat(d.quantity)))
					param.quantity = d.quantity
					Object.assign(param, { id: d.gwcId })
					url = 'shippingcar/delete'
				} else {
					this.$set(d, 'quantity', param.quantity)
					url = 'shippingcar/create'
				}
				if(parseFloat(d.quantity) > 9999) {
					
					if(d.skuMethodType == 1) {
						param.quantity = d.quantity = '9999.00'
						this.$set(d, 'quantity', d.quantity)
					} else {
						param.quantity = d.quantity = 9999
						this.$set(d, 'quantity', d.quantity)
					}
				}

				this.postRequest(url, param).then((resp) => {
					if(resp.data.state == 0 && resp.data.msg == 'success') {
						if(url == 'shippingcar/delete') {
							d.quantity = null
						}
						this.getQueryGrouplist(true)
					} else {
						this.$dialog.toast({
							mes: resp.data.msg,
							timeout: 1500
						});
						if(flgNum == 0) {
							d.quantity = d.skuMethodType == 1 ? (parseFloat(d.quantity) + 1).toFixed(2) : parseInt(d.quantity + 1);
						} else if(flgNum == 1) {
							if(url == 'shippingcar/create') {
								d.quantity = null
							} else {
								d.quantity = d.oldquantity
							}
						} else {
							d.quantity = d.oldquantity
						}
					}
				})
			},
			addQuantity(productcollectionArr, queryGrouplistArr) {
				for(let m = 0; m < productcollectionArr.length; m++) {
					for(let n = 0; n < queryGrouplistArr.length; n++) {
						if(productcollectionArr[m].id == queryGrouplistArr[n].skuId) {
							if(queryGrouplistArr[n].quantity != null && queryGrouplistArr[n].quantity) {
								if(productcollectionArr[m].skuMethodType == 1) {
									productcollectionArr[m].quantity = queryGrouplistArr[n].quantity.toFixed(2)
									productcollectionArr[m].oldquantity = queryGrouplistArr[n].quantity.toFixed(2)
								} else if(productcollectionArr[m].skuMethodType == 2) {
									productcollectionArr[m].quantity = queryGrouplistArr[n].quantity
									productcollectionArr[m].oldquantity = queryGrouplistArr[n].quantity
								}
							}
							productcollectionArr[m].gwcId = queryGrouplistArr[n].id
							productcollectionArr[m].skuId = queryGrouplistArr[n].skuId
						}
					}
				}
			},
			dataDel(arr) {
				for(let a = 0; a < this.cancelList.length; a++) {
					for(let b = 0; b < arr.length; b++) {
						if(this.cancelList[a].id == arr[b].id) {
							arr.splice(b, 1)
						}
					}
				}
			},
			loadList() {
				this.productList = []
				this.pageNum = 1
				this.cancelList = []
				this.$refs.productListsearch.$emit('ydui.infinitescroll.reInit');
				this.$refs.pullrefreshDemo.$emit('ydui.pullrefresh.finishLoad');
				this.getQueryGrouplist()
			},
			getProductList(keyWord) {
				this.$dialog.loading.open('商品加载中');
				var param = {
					code: this.gbgoodsId ? this.gbgoodsId : '',
					purchaserId: this.$root.userInfo.typeCode,
					supplierId: this.$route.query.sellerId,
					keyWord: '',
					pageNum: this.pageNum,
					pageSize: this.pageSize
				}
				if(this.searchInputVal) {
					param.code = ''
					param.keyWord = this.searchInputVal
				}
				// 是否为常买商品
				var purl;
				purl = 'productsku/getSkuByQuotation'
				if(this.$root.userInfo.typeId != 'buyer') {
					param.purchaserId = 0
				}
				this.postRequest(purl, param).then(resp => {
					this.$dialog.loading.close();
					if(resp.data && resp.data.state == 0) {
						if(resp.data.aaData.length > 0) {
							//收藏处理(取消收藏后，页面数据依然存在，删除请求回来已存在的数据)
							if(this.cancelList.length > 0) {
								this.dataDel(resp.data.aaData)
							}

							//购物车计算
							this.addQuantity(resp.data.aaData, this.queryGrouplist)
							this.productList = [...this.productList, ...resp.data.aaData];
							if(this.productList.length >= resp.data.dataCount) {
								/* 所有数据加载完毕 */
								this.$refs.productListsearch.$emit('ydui.infinitescroll.loadedDone');
								return;
							}
							/* 单次请求数据完毕 */
							this.$refs.productListsearch.$emit('ydui.infinitescroll.finishLoad');
							this.pageNum++;
						} else {
							this.productList = []
						}
					}
				})
			},
		},

	}
</script>

<style lang="scss">
	#SearchShopGoods {
		.search_input {
			width: 100%;
			box-sizing: border-box;
			padding: .08rem .25rem;
			/*background: #80C551;*/
			.search_input_children {
				border-radius: .08rem;
				border: 1px solid white;
				width: 100%;
				padding: .15rem;
				font-size: .28rem;
				color: #2F3927;
				text-indent: .5rem;
				width: 100%;
				background-color: white;
				background-image: url(../../assets/imgs/fangdajing.png);
				background-repeat: no-repeat;
				background-size: contain;
				background-size: .4rem .4rem;
				background-position: .1rem .12rem;
			}
		}
		.search_input_popup {
			/*position: fixed;*/
			z-index: 9999;
			top: 0;
			display: flex;
			align-items: center;
			padding: .08rem 0 .08rem .25rem;
			.search_input_children {
				width: 5rem;
				flex-grow: 1;
			}
			.close_popup {
				font-size: .32rem;
				text-align: center;
				color: white;
				width: 1rem;
				flex-grow: 0;
			}
		}
		ul.product-list {
			padding-top: 0rem;
			li {
				padding: 0.2rem 0;
				border-bottom: 1px solid #ddd;
				position: relative;
				.imgwarp {
					width: 1.6rem;
					height: 1.6rem;
					border-radius: 2px;
					flex-grow: 0;
					/*overflow: hidden;
					position: relative;*/
					img.goodpic {
						width: 100%;
						height: 100%;
					}
					img.scpic {
						position: absolute;
						top: 0;
						width: 0.32rem;
						height: 0.36rem;
					}
					.quehuo-s {
						width: 100%;
						height: 100%;
						position: absolute;
						background: rgba(0, 0, 0, 0.5);
						top: 0;
						left: 0;
						color: #fff;
					}
				}
				.info {
					flex: 1;
					position: relative;
					padding-right: .2rem;
				}
				.caigou_icon {
					position: absolute;
					right: 0.25rem;
					bottom: 0;
					margin-top: -0.22rem;
					img {
						display: block;
						width: 0.48rem;
						height: 0.48rem;
					}
					.quantity-input {
						background: #EEEEEE;
						width: 0.8rem;
						height: 0.48rem;
						margin: 0 2px;
						input {
							text-align: center;
						}
					}
				}
				.info {
					padding-left: 0.25rem;
					h1 {
						font-size: 0.3rem;
					}
					p {
						color: #797D77;
						padding: 0.1rem 0;
					}
					h3 {
						font-size: 0.3rem;
						color: #FF3D15;
					}
				}
				.addicon {
					position: absolute;
					right: 0.25rem;
				}
			}
		}
		ul.product-list {
			background: white;
			padding-top: 0;
			li {
				padding-left: 0.2rem;
			}
		}
		.name_4_span {
			color: #797D77;
			font-size: .24rem;
			padding-right: .03rem;
			font-weight: normal;
		}
	}
</style>