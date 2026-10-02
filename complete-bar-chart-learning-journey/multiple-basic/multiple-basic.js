async function drawWeatherBarChart(){
    let dataset = await d3.json("/data/my_weather_data.json")
    console.table(dataset) 

    // const metricAccessor = function(d){return d.humidity}
    // const yAccessor = function(d){return d.length}

    const width = 600

    const height = width * 0.6
    const marginLeft = 50
    const marginRight = 10
    const marginTop = 30
    const marginBottom = 50

    const boundsWidth = width - marginLeft - marginRight
    const boundsHeight = height - marginTop - marginBottom

    const drawHistogram = (metric) => {
        
        const metricAccessor = function(d){return d[metric]}
        const yAccessor = function(d){return d.length}

        const wrapper = d3.select("#wrapper")
                        .append("svg")
                        .attr("viewBox", `0 0 ${width} ${height}`)
                        .style("width", "100%")
                        .style("height", "auto")
                        .style("display", "block")
                        .attr("role", "figure")
                        .attr("tabindex", "0")

        wrapper.append("title")
                .text(`Histogram looking at the distribution of ${metric} in 2016`)

        const bounds = wrapper.append("g")
                                .style("transform", `translate(${marginLeft}px, ${marginTop}px)`)

        const xScale = d3.scaleLinear()
                            .domain(d3.extent(dataset, metricAccessor))
                            .range([0, boundsWidth])
                            .nice()

        const binGenerator = d3.histogram()
                                .domain(xScale.domain())
                                .value(metricAccessor)
                                .thresholds(12)

        const bins = binGenerator(dataset)

        console.log(bins)

        const yScale = d3.scaleLinear()
                            .domain([0, d3.max(bins, yAccessor)])
                            .range([boundsHeight, 0])
                            .nice()

        const binsGroup = bounds.append("g")
                                .attr("tabindex", "0")
                                .attr("role", "list")
                                .attr("aria-label", "histogram bars")

        const binGroups = binsGroup.selectAll("g")
                                    .data(bins)
                                    .enter()
                                    .append("g")
                                    .attr("tabindex", "0")
                                    .attr("role", "listitem")
                                    .attr("aria-label", function(d){return `There were ${yAccessor(d)} days between ${d.x0.toString().slice(0, 4)} and ${d.x1.toString().slice(0, 4)} humidity levels.`})
                        

        const barPadding = 1

        const barRects = binGroups.append("rect")
                                    .attr("x", function(d){return xScale(d.x0) + barPadding/2})  
                                    .attr("y", function(d){return yScale(yAccessor(d))})
                                    .attr("width", function(d){return d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding])})
                                    .attr("height", function(d){return boundsHeight - yScale(yAccessor(d))})
                                    .attr("fill", "darkslategrey")

        const barText = binGroups.filter(yAccessor)
                                    .append("text")
                                    .attr("x", function(d){return xScale(d.x0) + (xScale(d.x1) - xScale(d.x0))/2})
                                    .attr("y", function(d){return yScale(yAccessor(d)) - 5})
                                    .text(yAccessor)
                                    .style("text-anchor", "middle")
                                    .style("fill", "darkgrey")
                                    .style("font-size", "12px")
                                    .style("font-family", "sans-serif")
                                
        const mean = d3.mean(dataset, metricAccessor)

        const meanLine = bounds.append("line")
                                .attr("x1", xScale(mean))
                                .attr("x2", xScale(mean))
                                .attr("y1", -15)
                                .attr("y2", boundsHeight)
                                .attr("stroke", "maroon")
                                .attr("stroke-dasharray", "2px 4px")

        const meanLabel = bounds.append("text")
                                .attr("x", xScale(mean))
                                .attr("y", -20)
                                .text("mean")
                                .attr("fill", "maroon")
                                .style("font-size", "12px")
                                .style("text-anchor", "middle")

        const xAxis = bounds.append("g")
                            .attr("class", "xAxis")
                            .call(d3.axisBottom(xScale))
                            .style("transform", `translateY(${boundsHeight}px)`)

        const xAxisLabel = xAxis.append("text")
                                .attr("x", boundsWidth/2)
                                .attr("y", marginBottom - 10)
                                .attr("fill", "black")
                                .style("font-size", "1.4em")
                                .text(metric)


        wrapper.selectAll("text")
            .attr("role", "presentation")
            .attr("aria-hidden", "true")
    }


    const metrics = [
        "windSpeed",
        "moonPhase",
        "dewPoint",
        "humidity",
        "uvIndex",
        "windBearing",
        "temperatureMin",
        "temperatureMax"

    ]

    metrics.forEach(drawHistogram)




}

drawWeatherBarChart()