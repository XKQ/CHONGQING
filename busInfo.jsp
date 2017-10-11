<%@page import="CQ.DBC"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%
	String time = request.getParameter("time");
// 	String sql = "select A.time_,A.bus_num,A.speed,st_astext(A.geom) as geom,A.road_unit_id,A.zt,B.fdmc,st_astext(B.geom) as roadGeom"
// 			+ " from bus A, c3its_basic_road_unit_info B"
// 			+ " where A.time_=\'" + time +"\' and A.road_unit_id = B.id"
// 			+ " ORDER BY a.bus_num";
// 	String sql = "select id,fdmc,fdbm,lr,uuid,clxh,shape_leng,shape_le_1,zt,geom,time_,st_astext(geom) as geom from c3its_basic_road_unit_info";
	DBC dbc = new DBC();
	dbc.getConnection();
	String res = null;
	try{
		res = dbc.getBusRoadInfo(time);
	}catch(Exception e){
		e.printStackTrace();
	}
	dbc.closeConnection();
	out.clear();
	out.print(res);
%>