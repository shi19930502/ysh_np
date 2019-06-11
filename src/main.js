//最新加载router.js，然后main.js，然后mixin.js
import Vue from 'vue'
import App from './App.vue'

import router from './router'
import store from './store'

import { getRequest } from './utils/api'
import { postRequest } from './utils/api'
import { deleteRequest } from './utils/api'
import { putRequest } from './utils/api'

import ydui from 'vue-ydui';
/***/
import { Loading } from 'vue-ydui/dist/lib.rem/dialog'
import { Alert, Confirm } from 'vue-ydui/dist/lib.rem/dialog'

import 'vue-ydui/dist/ydui.rem.css'
/**重写样式表*/
import './assets/css/flex.css'
import './assets/css/overwrite.scss'

import mixin from './utils/mixin_common.js'

Vue.use(ydui);
Vue.prototype.getRequest = getRequest;
Vue.prototype.postRequest = postRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.putRequest = putRequest;
Number.prototype.toFixed = function(s) {
	return(Math.round(this * Math.pow(10, s)) / Math.pow(10, s)).toString();
}
router.beforeEach((route, redirect, next) => {
	//store.commit('updateLoadingStatus', true);
	var local=localStorage.getItem('quickUserInfo')
	if(local&& local!='{}'){
			if(SYSTEMID== 7 && (JSON.parse(local).typeId == 'merchant'||JSON.parse(local).typeId== 'buyer'||JSON.parse(local).typeId== 'merchant_buyer')) {
			Confirm({
				title: '提示：',
				mes: '登录账号与系统不符,请重新登录！',
				opts: [{
					txt: '确定',
					color: true,
					callback: () => {
						next({ path: '/f_login' })
					}
				}]
			});
		}else if(SYSTEMID==8&&!(JSON.parse(local).typeId=='merchant'||JSON.parse(local).typeId=='buyer'||JSON.parse(local).typeId=='merchant_buyer')){
			Confirm({
				title: '提示：',
				mes: '登录账号与系统不符,请重新登录！',
				opts: [{
					txt: '确定',
					color: true,
					callback: () => {
						next({ path: '/f_login' })
					}
				}]
			});
		}
	}
	
	Loading.open();
	next();
	if(route.name == 'Login') {
		next();
		console.log(1)
		return;
	}
	if(route.name != 'UserReg') {
		if(store.state.quickUserInfo.name == '未登录') {
			if(ADDR == 'beihuan' || ADDR == 'all'||ADDR == 'else') {
				console.log(2)
				//next({ path: '/f_ddxq' })
			} else {
				next({ path: '/Login' })
			}
		} else {
			next();
		}
	} else {
		next();
	}

});
//input
var u = navigator.userAgent;
var isPc=isPcOS()
var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
if(isIOS&&!isPc&&false) {
	document.body.addEventListener("click", function(e) {
		if(e.target.nodeName == "INPUT") {
			if(e.target.type == "text" || e.target.type == "password") {
				e.target.onblur = function() {
					window.setTimeout(function() {
						if('scrollIntoView' in document.activeElement) {
							document.activeElement.scrollIntoView();
						} else {
							document.activeElement.scrollIntoViewIfNeeded();
						}
					}, 100);
				}
			}
		} else if(document.activeElement.tagName == "TEXTAREA") {
			e.target.onblur = function() {
				window.setTimeout(function() {
					if('scrollIntoView' in document.activeElement) {
						document.activeElement.scrollIntoView();
					} else {
						document.activeElement.scrollIntoViewIfNeeded();
					}
				}, 100);
			}
		}
	})
}
//获取是否PC端
function isPcOS() {
	var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
	if(isWin) return true; //'Win'
	var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
	if(isMac) return true; //'Mac'
	var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
	if(isUnix) return true; //'Unix'
	var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
	if(isLinux) return true; //'Linux'
}
router.afterEach(route => {
	if(document.getElementsByClassName('yd-dialog-white-mask')[0]){
		document.getElementsByClassName('yd-dialog-white-mask')[0].remove()
	}
	Loading.close();
	//store.commit('updateLoadingStatus', false);
});

new Vue({
	el: '#app',
	router,
	store,
	render: h => h(App),
	mixins: [mixin],
});