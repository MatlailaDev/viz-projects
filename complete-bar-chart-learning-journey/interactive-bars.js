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
                        .style("width", "100%")
                        .style("height", "auto")
                        .style("display", "block")

    const bounds = wrapper.append("g")
                            .style("transform", `translate(${marginLeft}px, ${marginTop}px)`)


    bounds.append("g")
            .attr("class", "bins")
    bounds.append("line")
            .attr("class", "mean")    
    bounds.append("g")
            .attr("class", "x-axis")
            .style("transform", `translateY(${boundsHeight}px)`)
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


        const oldBinGroups = binGroups.exit()


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
                    .attr("y", boundsHeight - 5)

        binGroups = newBinGroups.merge(binGroups)


        const exitTransition = d3.transition()
                                    .ease(d3.easeLinear)
                                    .duration(600)

        const updateTransition = exitTransition.transition()
                                    .ease(d3.easeLinear)
                                    .duration(600)

        const updateTransitionMean = updateTransition.transition()
                                    .ease(d3.easeLinear)
                                    .duration(800)

        

        oldBinGroups.selectAll("rect")
                    .style("fill", "red")
                .transition(exitTransition)
                    .attr("y", boundsHeight)
                    .attr("height", 0)
        
        oldBinGroups.selectAll("text")
                .transition(exitTransition)
                    .attr("y", boundsHeight)

        oldBinGroups.transition(exitTransition)
                    .remove()


        const barRects = binGroups.select("rect")
                                    .on("mouseenter", onMouseEnter)
                                    .on("mouseleave", onMouseLeave)
                                .transition(updateTransition)
                                    .attr("x", (d) => xScale(d.x0) + barPadding)
                                    .attr("y", (d) => yScale(yAccessor(d)))
                                    .attr("width", (d) => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
                                    .attr("height", (d) => boundsHeight - yScale(yAccessor(d)))
                                    .style("fill", "#00BD9D")
                                    .attr("rx", "5px")


        const barText = binGroups.filter(yAccessor)
                                .select("text")
                            .transition(updateTransition)
                                .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0))/2)
                                .attr("y", (d) => yScale(yAccessor(d)) - 5)
                                .text((d) => yAccessor(d) || "")


        const mean = d3.mean(dataset, metricAccessor)
        console.log(mean)

        const meanLine = bounds.select(".mean")
                            .transition(updateTransitionMean)
                                .attr("x1", xScale(mean))
                                .attr("x2", xScale(mean))
                                .attr("y1", -20)                          
                                .attr("y2", boundsHeight)
                                .attr("stroke", "maroon")
                                .attr("stroke-dasharray", "2px 4px")

        const meanLabel = bounds.select(".meanLabel")
                            .transition(updateTransitionMean)
                                .attr("x", xScale(mean))
                                .attr("y", -20)
                                .text(`mean = ${mean.toFixed(3)}`)
                                .attr("fill", "maroon")
                                .style("text-anchor", "middle")


        const xAxis = bounds.select(".x-axis")
                            .transition(updateTransition)
                                .call(d3.axisBottom(xScale))



        const xAxisLabel = xAxis.select(".x-axis-label")
                                .attr("x", boundsWidth/2)
                                .attr("y", marginBottom - 10)
                            .transition()
                                .text(metric)
                                .style("fill", "black")

            // 7. Set up interactions
        const tooltip = d3.select("#tooltip")

        function onMouseEnter(event, datum) {

            // Fill style
            d3.select(this).style("fill", "seagreen")

            tooltip.select("#count")
                .text(yAccessor(datum))

            tooltip.select("#range")
                .text([datum.x0, datum.x1].join(" - "))



            // Convert chart coordinates -> pixels, accounting for the viewBox scaling
            const svgRect = wrapper.node().getBoundingClientRect()
            const wrapperRect = document.getElementById("wrapper").getBoundingClientRect()
            const k = svgRect.width / svgWidth

            const x = (svgRect.left - wrapperRect.left)
                    + (xScale(datum.x0) + (xScale(datum.x1) - xScale(datum.x0)) / 2 + marginLeft) * k
            const y = (svgRect.top - wrapperRect.top)
                    + (yScale(yAccessor(datum)) + marginTop - 5) * k

            tooltip.style("transform", `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`)
                    .style("opacity", 0.9)

        }

        function onMouseLeave() {

            // Fill style
            d3.select(this).style("fill", "#00BD9D")

            tooltip.style("opacity", 0)
        }

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

    const button = d3.select("#wrapper")
                    .append("button")
                    .text("Change metric")   

    button.node().addEventListener("click", onClick)

    function onClick(){
        selectedMetricIndex = (selectedMetricIndex + 1) % metrics.length
        drawHistogram(metrics[selectedMetricIndex])
    }
}

drawBars()