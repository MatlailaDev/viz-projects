async function drawBars(){
    const dataset = await d3.json("data/my_weather_data.json")
    console.table(dataset)

    const width = 600

    const svgWidth = width
    const svgHeight = width * 0.6
    const marginLeft = 50
    const marginRight = 10
    const marginTop = 35
    const marginBottom = 50

    const boundsWidth = svgWidth - marginLeft - marginRight
    const boundsHeight = svgHeight - marginTop - marginBottom

    const wrapper = d3.select("#wrapper")
                        .append("svg")
                        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)

    const bounds = wrapper.append("g")
                            .style("transform", `translate(${marginLeft}px, ${marginTop}px)`)


    bounds.append("g")
            .attr("class", "bins")
    bounds.append("line")
            .attr("class", "mean")    
    bounds.append("g")
            .attr("class", "x-axis")
            .style("transform", `translate(${boundsHeight}px)`)
          .append("text")
            .attr("class", "x-axis-label")
    bounds.append("text")
            .attr("class", "meanLabel")
    



    const drawHistogram = metric => {
        const metricAccessor = (d) => d[metric]
        const yAccessor = (d) => d.length

        const xScale = d3.scaleLinear()
                            .domain(d3.extent(dataset, metricAccessor))
                            .range([0, boundsWidth])
                            .nice()

        const binsGenerator = d3.histogram()
                                .domain(xScale.domain())
                                .value(metricAccessor)
                                .thresholds(12)

        const bins = binsGenerator(dataset)

        const yScale = d3.scaleLinear()
                            .domain([0, d3.max(bins, yAccessor)])
                            .range([boundsHeight, 0])
                            .nice()

        const barPadding = 1

        let binGroups = bounds.select(".bins")
                                .selectAll(".bin")
                                .data(bins)

        binGroups.exit()
                    .remove()

        const newBinGroups = binGroups.enter()
                                        .append("g")
                                        .attr("class", "bin")

        newBinGroups.append("rect")
                    .attr("x", (d) => xScale(d.x0) + barPadding)
                    .attr("y", boundsHeight)
                    .attr("width", (d) => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
                    .attr("height", 0)
                    .style("fill", "yellowgreen")
                
        newBinGroups.append("text")
                    .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0))/2)
                    .attr("y", boundsHeight)

        binGroups = newBinGroups.merge(binGroups)

        const barRects = binGroups.select("rect")
                                .transition()
                                .duration(2500)
                                    .attr("x", (d) => xScale(d.x0) + barPadding)
                                    .attr("y", (d) => yScale(yAccessor(d)))
                                    .attr("width", (d) => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
                                    .attr("height", (d) => boundsHeight - yScale(yAccessor(d)))
                                .transition()
                                    .style("fill", "cornflowerblue")

        const barText = binGroups.select("text")
                            .transition()
                            .duration(3500)
                                .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0))/2)
                                .attr("y", (d) => yScale(yAccessor(d)) - 5)
                                .text((d) => yAccessor(d) || "" /*yAccessor*/)

        const mean = d3.mean(dataset, metricAccessor)
        console.log(mean)

        const meanLine = bounds.selectAll(".mean")
                                .attr("x1", xScale(mean))
                                .attr("x2", xScale(mean))
                                .attr("y1", -20)
                                .attr("y2", boundsHeight)

        const meanLabel = bounds.select(".meanLabel")
                                .attr("x", xScale(mean))
                                .attr("y", -25)
                                .text(`mean = ${mean.toFixed(3)}`)
                                .attr("fill", "maroon")
                                .style("font-size", "12px")
                                .style("text-anchor", "middle")


        const xAxis = bounds.select(".x-axis")
                                .call(d3.axisBottom(xScale))
                                .style("transform", `translateY(${boundsHeight}px)`)


        const xAxisLabel = xAxis.select(".x-axis-label")
                                .attr("x", boundsWidth/2)
                                .attr("y", marginBottom - 10)
                                .text(metric)
                                .style("fill", "black")

    }

    const metrics = [
        "windSpeed",
        "moonPhase",
        "dewPoint",
        "humidity",
        "uvIndex",
        "windBearing",
        "temperatureMin",
        "temperatureMax",
        "temperatureHigh",
        "precipIntensityMax",
        "pressure"
    ]

    let selectedMetricIndex = 0
    drawHistogram(metrics[selectedMetricIndex])

    const button = d3.select("body")
                     .append("button")
                     .text("Change metric")   

    button.node().addEventListener("click", onClick)

    function onClick(){
        selectedMetricIndex = (selectedMetricIndex + 1) % metrics.length
        drawHistogram(metrics[selectedMetricIndex])
    }
}

drawBars()