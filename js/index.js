window.onload = function() {
	mapInit(getAllRoad());
	RANGE = new scale('btn', 'bar', 'time');
	document.getElementById("day").value = "2017-07-01";
}
//地图
var map = null;
//滑动条
var RANGE = null;
//回放标志
var SETTIMEOUTFlag = null;
// 路段单元
var XNSWFS_road_unit_layer = new ol.layer.Vector({
	title : '路段单元',
	name : "XNSWFS_road_unit_layer",
	visible : true,
	source : new ol.source.Vector(),
	style : real_road_style
});
//公交车图层
var BUS_info_layer = new ol.layer.Vector({
	title : '公交车图层',
	name : "BUS_info_layer",
	visible : true,
	source : new ol.source.Vector(),
	style : busStyle
});
function mapInit(callback) {
	map = new ol.Map({
		target : 'map',
		layers : [ 
			new ol.layer.Tile({
				source : new ol.source.OSM()
			}),
			XNSWFS_road_unit_layer,
			BUS_info_layer
		],
		view : new ol.View({
			projection : "EPSG:4326",
			center : [ 107.72095, 29.38774 ],
			minZoom : 10,
			maxZoom : 18,
			zoom : 12
		})
	});
	if (callback) {
		callback();
	}
}

/**
 * 获取所有路段单元
 * 
 * @returns
 */
function getAllRoad() {
	$.ajax({
		url : "data/c3its_basic_road_unit_info.data",
		type : "POST",
		async : "false",
		timeout : 5000,
		dataType : "json",
		success : function(data, textStatus, jqXHR) {
			if (data) {
				var features = new ol.format.GeoJSON().readFeatures(data);
				XNSWFS_road_unit_layer.getSource().addFeatures(features);
			}
		},
		error : function(xhr, textStatus) {
			console.log("error");
		},
		complete : function() {
			console.log("Load road completed.");
		}
	});
}
/**
 * 公交车图层控制
 * @param obj
 */
function buschkClick(obj){
	if(obj.checked){
		BUS_info_layer.setVisible(true);
	}else{
		BUS_info_layer.setVisible(false);
	}
}
/**
 * 获取具体时刻的数据
 * @param tm
 * @returns
 */
function getDetailInfo(tm, callback){
	$.ajax({
		url: "busInfo.jsp",
		type : "POST",
		async : "false",
		timeout : 5000,
		data:{
			time: tm
		},
		dataType : "json",
		success: function(data, textStatus, jqXHR){
			if(data){
				data = eval(data);
				if(callback){
					callback(data);
				}
			}
		}
	});
}
/**
 * 改变路段单元状态以及公交车信息
 * @param data
 * @returns
 */
function changeRoadStatus(data){
	var source = XNSWFS_road_unit_layer.getSource();
	var feats = source.getFeatures();
	var ids = new Array();
	for(var i = 0; i < data.length; i++){
		if(data[i].road_unit_id){
			var id = "c3its_basic_road_unit_info." + data[i].road_unit_id;
			ids.push(id);
			var feature = source.getFeatureById(id);
			if(feature){
				feature.set("zt", data[i].zt);
			}
		}
	}
	//遍历所有feature
	for(var i = 0; i < feats.length; i++){
		var f = feats[i];
		if(-1 == $.inArray(f.getId(), ids)){
			if(f.getProperties().zt != "0"){
				f.set("zt", 0);
			}
		}
	}
}
/**
 * 显示公交车信息
 * @param bsdata
 * @returns
 */
function showBusInfo(bus){
	var fs = new Array();
	for(var i = 0; i < bus.length; i++){
		var b = bus[i];
		var feat = new ol.Feature({
			geometry: new ol.geom.Point([b.longitude, b.latitude]),
			bus_id: b.bus_id,
			bus_num: b.bus_num,
			bus_speed: b.speed
		});
		fs.push(feat);
	}
	var source = BUS_info_layer.getSource();
	source.clear();
	source.addFeatures(fs);
}
/**
 * 回放
 */
function playback(){
	if(SETTIMEOUTFlag){
		clearTimeout(SETTIMEOUTFlag);
		SETTIMEOUTFlag = null;
	}else{
		var time = document.getElementById("time").innerHTML;
		time = hourMinutesToM(time);
		playbackevent(time);
	}
}

function playbackevent(i){
	if(i == 24 * 60){
		console.log("complete");
		return;
	}
	var date = document.getElementById("day").value;
	if(!date){
		alert("请选择日期");
		return;
	}
	
	var hour = Math.floor(i / 60);
	var minutes = i % 60;
	var str = (hour > 9 ? hour : ('0' + hour)) + ":" + (minutes > 9 ? minutes : ('0' + minutes));
	var timestr = date + " " + str;
	var btnPosition = RANGE.maxlen/(24*60-1)*i;
	RANGE.btnPosition(btnPosition);
	RANGE.ondrag(i, btnPosition);
	getDetailInfo(timestr, function(data){
		changeRoadStatus(data);
		showBusInfo(data);
	});
	SETTIMEOUTFlag = setTimeout(function(){
		playbackevent(++i);
	}, 500);
}
//取消回放
function quitPlayback(){
	if(SETTIMEOUTFlag){
		clearTimeout(SETTIMEOUTFlag);
		SETTIMEOUTFlag = null;
	}
}
/**
 * 日期选择事件
 */
function dateChange(obj){
	var date = obj.value;
	var time = document.getElementById("time").innerHTML;
	var timestr = date + " " + time;
	getDetailInfo(timestr, function(data){
		changeRoadStatus(data);
		showBusInfo(data);
	});
}
function hourMinutesToM(d){
	var res = null;
	if(d.indexOf(":") > 0){
		var arr = d.split(":");
		res = parseInt(arr[0]) * 60 + parseInt(arr[1]);
	}
	return res;
}
var scale = function(btn, bar, time) {
	this.btn = document.getElementById(btn);
	this.bar = document.getElementById(bar);
	this.time = document.getElementById(time);
	this.step = this.bar.getElementsByTagName("div")[0];
	this.maxlen = null;
	this.init();
};
scale.prototype.init = function() {
	var f = this, g = document, b = window, m = Math;
	f.btn.onmousedown = function(e) {
		var x = (e || b.event).clientX;
		var l = this.offsetLeft;
		var max = f.bar.offsetWidth - this.offsetWidth;
		f.maxlen = max;
		g.onmousemove = function(e) {
			var thisX = (e || b.event).clientX;
			var to = m.min(max, m.max(-2, l + (thisX - x)));
			f.btnPosition(to);
			f.ondrag(m.round(m.max(0, to / max) * (60 * 24 - 1)), to);
			b.getSelection ? b.getSelection().removeAllRanges() : g.selection.empty();
		};
		g.onmouseup = new Function('this.onmousemove=null');
	};
	f.btn.onmouseup = function(e){
		f.ondragend(f.time.innerHTML);
	}
}
scale.prototype.ondrag = function(pos, x) {
	this.step.style.width = Math.max(0, x) + 'px';
	var hour = Math.floor(pos / 60);
	var minutes = pos % 60;
	this.time.innerHTML = (hour > 9 ? hour : ('0' + hour)) + ":"
		+ (minutes > 9 ? minutes : ('0' + minutes));
}
scale.prototype.ondragend = function(hourMinutes){
	var date = document.getElementById("day").value;
	if(!date){
		return;
	}
	if(SETTIMEOUTFlag){
		clearTimeout(SETTIMEOUTFlag);
		SETTIMEOUTFlag = null;
	}
	var timestr = date + " " + hourMinutes;
	getDetailInfo(timestr, function(data){
		changeRoadStatus(data);
		showBusInfo(data);
	});
}
scale.prototype.btnPosition = function(num){
	this.btn.style.left = num + "px";
}
