R20 同源室内空间模型

入口：model-viewer/index.html。须通过HTTP服务访问，服务根可设output-r20-interior-review或更上层。
不依赖远程CDN。Three及图文纹理均为本地磁盘文件。
只读取 ../R20_geometry.json；不会回落到旧R18几何。

自动化接口：
window.RENDER_READY 为true后可截图；window.RENDER_ERRORS保存启动错误。
window.setView('overview'|'entrance'|'special'|'assembly'|'workshop'|'viewing'|'story'|'reading_north'|'reading_south'|'gallery_north'|'gallery_reverse'|'gallery_exit')
window.setClean(true) 隐藏UI；也可URL带?clean&view=story。
window.setFog(true) 开启雾化演示；false恢复透明。
window.CAMERAS 与 cameras.json 含相机。
window.getModelAudit() 获取对象清单。
拖动仅转头，不位移穿墙。点击机位按钮换视点。

建模来源：
所有平面家具、柱、井道坐标来自R20。主吧后柜保留原多边形避柱凹口。
外墙按site边界、doors切洞；修复南墙D07、东侧观察玻璃、馆内D08完整绘制。
12柱只由JSON columns生成，不生成装饰柱。
没有可靠现场外窗坐标，未擅自新增外窗；无实体顶棚遮挡鸟瞰；灯轨只是照明意向，不冒充现场梁网。
30咖啡席=20单椅+10木卡座，另10拼装单椅。
物件高度除已提供BK柜2600外为设计示意。格纳库三组为红金/银灰编号人形体量，未伪称真实库存或精细IP模型。
图文纹理来自story-panels manifest，保持各正面朝向；缺少真实收藏、修复照片的内容已由面板明确注明。

静态检查已通过：JS语法、12机位、13纹理、柱和席数。浏览器画面和相机遮挡由主线程串行验证。
