//道路实况
var real_road_style = function(feature, resolution){
    if(feature.getProperties().zt == "0")
    {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00FF00',
                width: 2
            })
        })
    }
    else if(feature.getProperties().zt == "1")
    {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#FFFF00',
                width: 2
            })
        })
    }
    else
    {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#FF0000',
                width: 2
            })

        })
    }
}
//公交车style
var busStyle = function(feature, resolution){
//	console.log(feature.getId() + feature.getProperties().bus_num)
	return new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [0.5, 0.5],
			src: "css/images/car.png"
		}),
		text: new ol.style.Text({
			font: "12px sans-serif",
			offsetX: 60,
			text: "编号: " + feature.getProperties().bus_num + "\n速度: " + feature.getProperties().bus_speed +"km/h"
		})
	});
}