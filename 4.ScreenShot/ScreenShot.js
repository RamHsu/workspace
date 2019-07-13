import 'rgbcolor';
import 'stackblur';
import canvg from 'canvg';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
	/**
	 *  区域截图
	 *  @param  element  -   d
	 *  @param  name
	 *  @param  type
	 *  @param  options -   其他参数
	 *      {
	 *          appType
	 *          isAnswer
	 *          callback
	 *      }
	 *  */
    getPrintScreen: function (vue, element, name, type, options) {
        var chartContainer = $(element),
            browserInfo = FocusMethod.getBrowserInfo(),
            canvasImg = [],
            vipFlag = false;
        options = options || {};
        var screenWatting = document.createElement('div');
        screenWatting.classList = "get-screen-watting";
        screenWatting.innerHTML = "<img width='80' src=" + require("../assets/images/focus-scrolling.gif") + " />";
        document.body.appendChild(screenWatting);

        chartContainer.find(".parcoords canvas").each(function (index, node) {
            canvasImg.push(canvas2png(node));
        });

        var copyDom = chartContainer.clone();
        var width = element.scrollWidth,
            height = element.scrollHeight;
        document.body.appendChild(copyDom[0]);
        copyDom.width(width + "px");
        copyDom.height(height + "px");

        if (chartContainer.hasClass("pinboard-layout-canvas")) {
            var bgContainer = chartContainer.siblings(".pinboard-layer-background"),
                bgWidth = bgContainer.width(),
                bgHeight = bgContainer.height(),
                pinColor = bgContainer.css("background-color"),
                pinBg = bgContainer.css("background-image"),
                pinBgs = bgContainer.css("background-size"),
                pinBgr = bgContainer.css("background-repeat");
                
            copyDom.css({
                "background-color": pinColor,
                "background-image": pinBg,
                "background-size": pinBgs,
                "background-repeat": pinBgr
            });

            width = width > 0 ? width : bgWidth;
            height = height > 0 ? height : bgHeight;
        }

        // 处理copyDom，解决样式丢失的问题（部分重要样式转化为行内样式）
        width = copyDom[0].scrollWidth;
        height = copyDom[0].scrollHeight || height;
        copyDom.width(width + "px");
        copyDom.height(height + "px");
        copyDom.addClass("fr");
        copyDom.css({ "position": "relative" });
        copyDom.find(".configure-chart-btns").remove();
        copyDom.find(".save-pdf").remove();
        copyDom.find(".answer-layout").each(function (index, node) {
            var self = $(node);
            self.css({
                "width": self.css("width"),
                "height": self.css("height"),
                "position": self.css("position"),
                "top": self.css("top"),
                "right": self.css("right"),
                "bottom": self.css("bottom"),
                "left": self.css("left"),
                "background-color": self.css("background-color")
            });
        });
        copyDom.find(".parcoords canvas").each(function (index, node) {
            var self = $(node);
            self.parent()[0].appendChild(canvasImg[index]);
            $(canvasImg[index]).css({
                "position": self.css("position"),
                "top": self.css("top"),
                "right": self.css("right"),
                "bottom": self.css("bottom"),
                "left": self.css("left"),
                "margin": self.css("margin"),
                "margin-top": self.css("margin-top"),
                "margin-right": self.css("margin-right"),
                "margin-bottom": self.css("margin-bottom"),
                "margin-left": self.css("margin-left")
            });
            self.remove();
        });
        copyDom.find(".funnel-list").css("overflow", "hidden");
        copyDom.find(".boxplot .outlier").each(function (index, node) {
            var self = $(node);
            $(node).css({
                "stroke": self.css("stroke")
            });
        });
        copyDom.find(".boxplot line").each(function (index, node) {
            var self = $(node);
            $(node).css({
                "fill": self.css("fill"),
                "stroke": self.css("stroke"),
                "stroke-width": self.css("stroke-width")
            });
        });
        copyDom.find(".boxplot rect").each(function (index, node) {
            var self = $(node);
            $(node).css({
                "fill": self.css("fill"),
                "stroke": self.css("stroke"),
                "stroke-width": self.css("stroke-width")
            });
        });
        copyDom.find(".axis path.domain").each(function (index, node) {
            var self = $(node);
            $(node).css({
                "fill": self.css("fill"),
                "stroke": self.css("stroke"),
                "shape-rendering": self.css("shape-rendering")
            });
        });
        copyDom.find(".axis .tick line").each(function (index, node) {
            var self = $(node);
            $(node).css({
                "fill": self.css("fill"),
                "stroke": self.css("stroke"),
                "shape-rendering": self.css("shape-rendering")
            });
        });
        copyDom.find(".parcoords rect").each(function (index, node) {
            var self = $(node);
            $(node).css({
                "fill": self.css("fill"),
                "stroke-width": self.css("stroke-width")
            });
        });
        copyDom.find(".ticks").each(function (index, node) {
            var self = $(node),
                stroke = self.css("stroke");
            self.css({
                "stroke": stroke
            });
        });
        copyDom.find("*[alarm-status=true]").each(function (index, node) {
            var self = $(node),
                fill = self.css("fill");
            self.css({
                "fill": fill,
                "stroke": "none"
            });
        });
        copyDom.find(".map-alarm-status").each(function (index, node) {
            var self = $(node),
                fill = self.css("fill");
            self.css({
                "fill": fill,
                "stroke": "#fff"
            });
        });
        copyDom.find("text.labels").each(function (index, node) {
            if ($(node).css("display") === "none") $(node).remove();
        });
        copyDom.find(".chart-container.map-container").each(function (index, node) {
            var self = $(node), mapContainer = self.children().eq(1), mapId = mapContainer.attr("id") || "";
            if (mapId && mapId.indexOf("map") > -1) mapId = parseInt(mapId.replace("map", ""));
            if (mapId !== NaN) {
                var url = map.LLdatas[mapId] && map.LLdatas[mapId].getUrl();
                if (url) {
                    vue.axios({
                        url: _localUrls.externalImg,
                        method: "post",
                        data: url,
                        responseType: 'blob'
                    })
                    .then(function successCallback(response) {
                        var blob = response.data;
                        blobToDataURI(blob, function (src) {
                            var img = document.createElement("img");
                            img.src = src;
                            mapContainer.remove();
                            self.prepend(img);
                        });
                    })
                    .catch(function(error) {
                        console.log(error);
                        vue.ajaxErrorHandler("error");
                    });
                }
            }
        });
        if (browserInfo.browser === "chrome") {
            copyDom.find(".parcoords .tick text").each(function (index, node) {
                var self = $(node);
                self.css({
                    "font-size": "12px",
                    "transform": "scale(0.917)"
                });
            });
            copyDom.find("axis .tick text").each(function (index, node) {
                var self = $(node),
                    fontSize = parseFloat(self.css("font-size")) + "px",
                    transform = self.css("transform");
                self.css({
                    "font-size": fontSize,
                    "transform": function () {
                        var container = self.closest(".chart-container");
                        if (fontSize === "12px" && !container.hasClass("font-bigger")) {
                            if (container.hasClass("font-smaller")) {
                                return transform + "scale(0.75)";
                            } else if (container.hasClass("font-minimum")) {
                                return transform + "scale(0.667)";
                            } else {
                                return transform + "scale(0.834)";
                            }
                        }
                        return transform;
                    }
                });
            });
            copyDom.find("text.text").each(function (index, node) {
                var self = $(node),
                    fontSize = parseFloat(self.css("font-size")) + "px",
                    transform = self.css("transform");
                self.css({
                    "font-size": fontSize,
                    "transform": function () {
                        var container = self.closest(".chart-container");
                        if (fontSize === "12px" && !container.hasClass("font-bigger")) {
                            if (container.hasClass("font-smaller")) {
                                return transform + "scale(0.75)";
                            } else if (container.hasClass("font-minimum")) {
                                return transform + "scale(0.667)";
                            } else {
                                return transform + "scale(0.834)";
                            }
                        }
                        return transform;
                    }
                });
            });
        }
        if (type !== "blob") {
            if (name) {
                var childDom = copyDom.children().eq(0);
                if (childDom.hasClass("answer-container")) {
                    childDom.css("top", "60px");
                }
                copyDom.prepend("<p class='get-screen-title text-clip " + (options.isAnswer ? "mr50" : "") + "'>" + name + "</p>");
                height += 60;
            }
            if (options.appType === "free_spl") {
                copyDom.append("<div class='watermark-cover'></div>");
            } else {
                vipFlag = true;
                copyDom.css({
                    "height": height + 100 + "px"
                });
                if (options.isAnswer) copyDom.find(".chart-container").height(height + "px");
                copyDom.append("<div class='watermark-bottom'></div>");
            }
        }

        // console.log("append copyDom & reset style");

        setTimeout(function () {
            svg2canvas(copyDom);

            html2canvas(copyDom[0], {
                // useCORS: true,
                // logging: true,
                dpi: window.devicePixelRatio * (type === "pdf" ? 5 : 2),
                width: width - (options.isAnswer ? 50 : 0),
                height: height + (vipFlag ? 100 : 0)
            }).then(function (canvas) {
                copyDom.remove();
                saveCanvAs(canvas, name, type, function () {
                    $(screenWatting).remove();
                });
                typeof options.callback === 'function' && options.callback.call(this);
            });
        }, 1000);

		/**
		 * @param canvas canvas对象
		 * @param type 保存类型，默认为png，可选pdf，jpg，jpeg，bmp
		 * */
        function saveCanvAs(canvas, name, type = "png", callback) {
            var type = type.toLowerCase();
            if (type === "pdf") {
                var imgData = canvas.toDataURL("image/png"), img = new Image();
                var contentWidth = canvas.width;
                var contentHeight = canvas.height;
                img.src = imgData;
                img.onload = function () {
                    // 此处需要注意，pdf横置和竖置两个属性，需要根据宽高的比例来调整，不然会出现显示不完全的问题
                    // 根据图片的尺寸设置pdf的规格，要在图片加载成功时执行，之所以要*0.225是因为比例问题
                    var doc;
                    if (contentWidth > contentHeight) {
                        doc = new jsPDF("l", "mm", [contentWidth, contentHeight]);
                    } else {
                        doc = new jsPDF("p", "mm", [contentWidth, contentHeight]);
                    }
                    doc.addImage(imgData, "PNG", 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), undefined, 'FAST');
                    doc.save((name || "pdf_" + new Date().getTime()) + ".pdf");

                    typeof callback === 'function' && callback.call(this);
                }
            } else if (type === "blob") {
                var dataurl = canvas.toDataURL('image/png', 0.5);
                var myBlob = dataURLtoBlob(dataurl);
                typeof callback === 'function' && callback.call(this);
                typeof options.getUrlCallback === 'function' && options.getUrlCallback(myBlob);
            } else {
                if (type !== "png" && type !== "jpg" && type !== "jpeg" && type !== "bmp") {
                    type = "png";
                    // console.log("Type error, saved as PNG by default!");
                }
                var imgData = canvas.toDataURL("image/" + type + ""), oA = document.createElement("a");
                oA.download = (name || type + "_" + new Date().getTime()) + "." + type;
                oA.href = imgData;
                document.body.appendChild(oA);
                oA.click();
                oA.remove();

                typeof callback === 'function' && callback.call(this);
            }

            // console.log("saveCanvAs" + type);
        }

		/**
		 * @param targetElem 截图区域
		 * */
        function svg2canvas(targetElem) {
            var svgElem = targetElem.find('svg');
            svgElem.each(function (index, node) {
                var parentNode = node.parentNode;
                // 由于现在的IE不支持直接对svg标签node取内容，所以需要在当前标签外面套一层div，通过外层div的innerHTML属性来获取
                var tempNode = document.createElement('div');
                tempNode.appendChild(node);
                var svg = tempNode.innerHTML;
                var canvas = document.createElement('canvas');
                if (node.style.position) {
                    canvas.style.position += node.style.position;
                    canvas.style.left += node.style.left;
                    canvas.style.top += node.style.top;
                }
                // 转换
                canvg(canvas, svg);

                parentNode.appendChild(canvas);
            });

            // console.log("svg2canvas");
        }

		/**
		 *
		 * 将canvas转为png，返回值为image对象
		 * @param {*} canvas canvas对象
		 */
        function canvas2png(canvas) {
            var img = new Image();
            img.src = canvas.toDataURL("image/png");
            return img;
        }

        function blobToDataURI(blob, callback) {
            var reader = new FileReader();
            reader.onload = function (e) {
                callback(e.target.result);
            }
            reader.readAsDataURL(blob);
        }

        function dataURLtoBlob(dataurl) {
            var arr = dataurl.split(","),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }
    }
}