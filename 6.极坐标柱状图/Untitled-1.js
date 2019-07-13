        // 画柱子
        var spiralLength = path.node().getTotalLength();
        var barWidth = spiralLength / dataset.length;

        var timeScale = d3.time.scale()
            .domain(d3.extent(dataset, function(d) { return d.date; }))
            .range([barWidth, spiralLength]);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) { return d.y0; })])
            .range([0, sliceRadius - 20]);

        var radialRect = chartset.append("g").attr("class", "radial-rect");
        radialRect.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                var linePer = timeScale(d.date);
                var posOnLine = path.node().getPointAtLength(linePer);
                var angleOnLine = path.node().getPointAtLength(linePer - barWidth);

                d.linePer = linePer;
                d.x = posOnLine.x;
                d.y = posOnLine.y;
                d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180) / Math.PI - 90;

                return d.x;
            })
            .attr("y", function(d) {
                return d.y;
            })
            .attr("width", function(d) {
                return barWidth;
            })
            .attr("height", function(d) {
                return yScale(d.y0);
            })
            .style("fill", function(d) {
                return color(d.group);
            })
            .style("stroke", "none")
            .attr("transform", function(d) {
                return "rotate(" + d.a + "," + d.x + "," + d.y + ")";
            });

        var tF = d3.time.format("%b %Y");
        var firstInMonth = {};

        radialRect.selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .attr("dy", 10)
            .style("text-anchor", "start")
            .style("font", "10px arial")
            .append("textPath")
            .filter(function(d) {
                var sd = tF(d.date);
                if (!firstInMonth[sd]) {
                    firstInMonth[sd] = 1;
                    return true;
                }
                return false;
            })
            .text(function(d) {
                return tF(d.date);
            })
            .attr("xlink:href", "#spiral")
            .style("fill", "grey")
            .attr("startOffset", function(d) {
                return ((d.linePer - barWidth) / spiralLength) * 100 + "%";
            });