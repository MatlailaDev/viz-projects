async function drawBars(){

    // 1. Access Data
    const dataset = await d3.json("/data/my_weather_data.json")
    console.table(dataset)

    const metricAccessor = (d) => d.humidity

    // 2. Create Dimensions
    const width = 600

    const svgWidth = width
    const svgHeight = width*0.6
    const marginLeft = 50
    const marginRight = 10
    const marginTop = 35
    const marginBottom = 50

    const boundsWidth = svgWidth - marginLeft - marginRight
    const boundsHeight = svgHeight - marginTop - marginBottom

    // 3. Draw Canvas
    const wrapper = d3.select("#wrapper")
                        .append("svg")
                        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)

    const bounds = wrapper.append("g")
                            .style("transform", `translate(${marginLeft}px, ${marginTop}px)`)


    // 4.Create Scales
    const xScale = d3.scaleLinear()
                        .domain(d3.extent(dataset, metricAccessor))
                        .range([0, boundsWidth])
                        .nice()

    const binGenerator = d3.histogram()
                            .domain(xScale.domain())
                            .value(metricAccessor)
                            .thresholds(12)
    
    const bins = binGenerator(dataset)
    console.table(bins)

    const yAccessor = (d) => d.length

    const yScale = d3.scaleLinear()
                        .domain([0, d3.max(bins, yAccessor)])
                        .range([boundsHeight, 0])
                        .nice()
                        
    // 5.Draw Data
    
    // INIT Constants
    bounds.append("g")
            .attr("class", "bins")
    bounds.append("line")
            .attr("class", "mean")
    bounds.append("text")
            .attr("class", "meanLabel")
    bounds.append("g")
            .attr("class", "x-axis")
            .style("transform", `translateY(${boundsHeight}px)`)
        .append("text")
            .attr("class", "x-axis-label")
    
    
    const barPadding = 3

    let binsGroup = bounds.select(".bins")
                            .selectAll(".bin")
                            .data(bins)
    
    
    binsGroup.exit()
                .remove()
    
    console.table(binsGroup)
    
    const newBinsGroup = binsGroup.enter()
                                    .append("g")
                                    .attr("class", "bin")

    newBinsGroup.append("rect")
            .on("mouseover", function doThis(event, d){d3.select(this).attr("fill", "black")})
            .on("mouseout", function doThat(event, d){d3.select(this).attr("fill", "#00BD9D")})
                .attr("x", (d) => xScale(d.x0) + barPadding)
                .attr("y", boundsHeight)
                .attr("width", (d) => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
                .attr("height", 0)

    newBinsGroup.append("text")
                .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0))/2)
                .attr("y", (d) => boundsHeight - 5)

    binsGroup = newBinsGroup.merge(binsGroup)

    const updateTransition = d3.transition()
                                .ease(d3.easeLinear)
                                .duration(1000)

    const updateTransitionMean = d3.transition()
                                .ease(d3.easeLinear)
                                .duration(1600)

    const barRects = binsGroup.select("rect")
                            .transition(updateTransition)
                                .attr("x", (d) => xScale(d.x0) + barPadding)
                                .attr("y",(d) => yScale(yAccessor(d)))
                                .attr("width", (d) => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
                                .attr("height", (d) => boundsHeight - yScale(yAccessor(d)))
                                .attr("fill", "#00BD9D")
                                .attr("rx", "7px")

    const barText = binsGroup.filter(yAccessor)
                                .select("text")
                            .transition(updateTransition)
                                .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0))/2)
                                .attr("y", (d) => yScale(yAccessor(d)) - 5)
                                .text(yAccessor)
                                .attr("fill", "black")
                                .style("text-anchor", "middle")
                                .style("font-size", "12px")

    
    const mean = d3.mean(dataset, metricAccessor)

    const meanLine = bounds.select(".mean")
                        .transition(updateTransitionMean)
                            .attr("x1", xScale(mean))
                            .attr("x2", xScale(mean))
                            .attr("y1", -20)
                        .transition(updateTransition)
                            .attr("y2", boundsHeight)
                            .attr("stroke", "maroon")
                            .attr("stroke-dasharray", "2px 4px")

    const meanLabel = bounds.select(".meanLabel")
                        .transition(updateTransitionMean) 
                            .attr("x", xScale(mean))
                            .attr("y", -20)
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(500)
                            .text(`mean = ${mean.toFixed(3)}`)
                            .style("font-size", "13px")
                            .style("text-anchor", "middle")
                            .style("fill", "maroon")

    const xAxis = bounds.select(".x-axis")
                        .call(d3.axisBottom(xScale))
    
    const xAxisLabel = bounds.select(".x-axis-label")
                            .attr("x", boundsWidth/2)
                            .attr("y", marginBottom - 10)
                            .attr("fill", "black")
                            .style("font-size", "14px")
                            .html("Humididty")

}

drawBars()