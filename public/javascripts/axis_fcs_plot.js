// https://medium.com/@xoor/implementing-charts-that-scale-with-d3-and-canvas-3e14bbe70f37
// https://bl.ocks.org/mbostock/3680958
// https://bl.ocks.org/git-ashish/bc614e2e2d41ab01ce1bc62849a5a54f


    var num = 50000,
        xMid=500,
        yMid=300,
        xSD=100,
        ySD=225,
        transform,
        gxAxis,
        gyAxis,
        xAxis,
        yAxis,
        xAxisScale,
        yAxisScale,
        scaleX,
        scaleY,
        ctx = null,
        svg = null,
        dataa = [],
        xsize=1,
        ysize=1,
        shape = 'circle',
        radius=1,
        counts=[];

    var margin = {top: 20, right: 20, bottom: 40, left: 70},
    fullWidth = 600,
    width = fullWidth- margin.left - margin.right,
    fullHeight = 600,
    height = fullHeight - margin.top - margin.bottom;  
    

      
    // wait for page load to complete before making plots
    document.addEventListener("DOMContentLoaded", function(event) { 

        const container = d3.select('#plot-container'); 
         svgChart = container.append('svg:svg')
            .attr("width", fullWidth)
            .attr("height", fullHeight)
            .attr('class', 'svg-plot')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        canvasChart = container.append('canvas')
            .attr("width", width - 1)
            .attr("height", height - 1)
            .style('margin-left', margin.left + 'px')
            .style('margin-top', margin.top + 'px')            
            // .style("transform", "translate(" + (margin.left + 1) +
            //     "px" + "," + (margin.top + 1) + "px" + ")")
            .attr('id', 'canvas')
            .attr('class', 'canvas-plot')
            ;

        canvasChart.call(zoom_function);
        ctx = canvasChart.node().getContext("2d")

        var xRange = yRange =[]
        xAxisScale = d3.scaleLinear()
            // .domain([xRange[0] - 5, xRange[1] + 5])
            .domain([0,1000])
            .range([0, width])
            .nice();

        yAxisScale = d3.scaleLinear()
            // .domain([yRange[0] - 5, yRange[1] + 5])
            .domain([0,1000])
            .range([height,0])
            .nice();

        xAxis = d3.axisBottom(xAxisScale);
        yAxis = d3.axisLeft(yAxisScale);


        // slider controls
            var sliderCount = d3
                .sliderBottom()
                .min(10)
                .max(150)
                .width(300)
                .step(1)
                //- .tickFormat(d3.format('0'))
                .ticks(5)
                .default(num/1000)
                .on('end', val => {
                    d3.select('p#value-count').text(d3.format('0')(val)+'k');
                    num=+val*1000
                    updatePlot()
                });
            var gCount = d3
                .select('div#slider-count')
                .append('svg')
                .attr('width', 400)
                .attr('height', 75)
                .append('g')
                .attr('transform', 'translate(15,30)');
            gCount.call(sliderCount);   

            var sliderYPos = d3
                .sliderBottom()
                .min(0)
                .max(1000)
                .width(300)
                .step(25)
                // .height(30)
                //- .tickFormat(d3.format('0'))
                .ticks(5)
                .default(xMid)
                .on('end', val => {
                    d3.select('p#value-simple').text(d3.format('0')(val));
                    xMid=val
                    updatePlot()
                });
            var gSimpleYPos = d3
                .select('div#slider-simple')
                .append('svg')
                .attr('width', 400)
                .attr('height', 75)
                .append('g')
                .attr('transform', 'translate(15,30)');
            gSimpleYPos.call(sliderYPos); 


            // Vertical
            var sliderXPos = d3
                .sliderBottom()
                .min(0)
                .max(1000)
                .width(300)
                // .height(height)
                .step(25)
                //- .tickFormat(d3.format('0'))
                .ticks(5)
                .default(yMid)
                .on('end', val => {
                    d3.select('p#value-vertical').text(d3.format('0')(val));
                    yMid=val
                    updatePlot()          
                });
            var gVertical = d3
                .select('div#slider-vertical')
                .append('svg')
                .attr('width', width+30)
                .attr('height', 75)

                // .attr('width', 75)
                // .attr('height', height)
                .append('g')
                .attr('transform', 'translate(15,30)');
            gVertical.call(sliderXPos);

            var sliderXSD = d3
                .sliderBottom()
                .min(0)
                .max(500)
                .width(300)
                .step(1)
                //- .tickFormat(d3.format('0'))
                .ticks(5)
                .default(xSD)
                .on('end', val => {
                    d3.select('p#value-count').text(d3.format('0')(val));
                    xSD=+val
                    updatePlot()
                });
            var gXSD = d3
                .select('div#slider-count')
                .append('svg')
                .attr('width', 400)
                .attr('height', 75)
                .append('g')
                .attr('transform', 'translate(15,30)');
            gXSD.call(sliderXSD);  

            var sliderYSD = d3
                .sliderBottom()
                .min(0)
                .max(500)
                .width(300)
                .step(1)
                //- .tickFormat(d3.format('0'))
                .ticks(5)
                .default(ySD)
                .on('end', val => {
                    d3.select('p#value-count').text(d3.format('0')(val));
                    ySD=+val
                    updatePlot()
                });
            var gYSD = d3
                .select('div#slider-count')
                .append('svg')
                .attr('width', 400)
                .attr('height', 75)
                .append('g')
                .attr('transform', 'translate(15,30)');
            gYSD.call(sliderYSD);  






        // create SVG axes
            gxAxis = svgChart.append('g')
               .attr('transform', `translate(0, ${height})`)
               .call(xAxis);

            gyAxis = svgChart.append('g')
               .call(yAxis);

        // Add axis labels
            svgChart.append('text')
               .attr('x', `-${height/2}`)
               .attr('dy', '-3.5em')
               .attr('transform', 'rotate(-90)')
               // .attr('font-family','helvetica')
               .attr('class', 'axis_label')
               .text('Channel A');
            svgChart.append('text')
               .attr('x', `${width/2}`)
               .attr('y', `${height + 40}`)
               // .attr('font-family','helvetica')
               .attr('class', 'axis_label')
               .text('Channel B')
           


        updatePlot()        
    });


    // color scale
    const colorScale = d3.scaleLinear()
        .domain([0,10])
        .range([0,1])

    // count data into bins
    function count(p) {
        counts = {}
        p.forEach(function(x) { counts[[x.x,x.y]] = (counts[[x.x,x.y]] || 0)+1 })

        // https://stackoverflow.com/a/1069840/4483158
        var sortable = [];
        for (var x in counts) {
            sortable.push([x, counts[x]]);
        }

        sortable.sort(function(a, b) {
            return a[1] - b[1];
        });

        return sortable
    }

    // global scatter drawing function
    function draw(transform = d3.zoomIdentity, fractionalDraw=false ){
        t = transform

        // only draw fraction of data if we are actively moving
        if (fractionalDraw) drawData = fractionOfCounts
        else drawData = counts

        ctx.fillStyle = "rgba(200 ,200,200,0)"
        ctx.fillRect(0,0,width,height)

        scaleX = transform.rescaleX(xAxisScale);
        scaleY = transform.rescaleY(yAxisScale);

        gxAxis.call(xAxis.scale(scaleX));
        gyAxis.call(yAxis.scale(scaleY));

        ctx.clearRect(0, 0, width, height);

        console.log(`drawing ${shape} using radius: ${radius} or xsize,ysize: ${xsize},${ysize}`)
        drawData.forEach(function(i){
            ctx.beginPath();
            drawPointColor_array(i[0], i[1], transform)
            ctx.fill();

        })
        ctx.textAlign = 'center'
        ctx.fillText("Title goes here", width/2, 10);

    }


    // function get_point_size(){
    //     xbins=Math.abs(xRange[1]-xRange[0])
    //     ybins=Math.abs(yRange[1]-yRange[0])
    //     xsize = Math.max(width/xbins,1)
    //     ysize = Math.max(height/ybins,1)
    //     radius = Math.min(xsize,ysize)
    //     console.log(`xs: ${xsize}. ys:${ysize}`)
    // }

    function drawPointColor_array(xy,c,transform,xsize=1,ysize=1) {
        color = d3.interpolateSpectral(colorScale(c))
        ctx.fillStyle = color
        var [x,y] = xy.split(',')

        transformedX = scaleX(x)
        transformedY = scaleY(y)

        if (shape=="rect") {
            ctx.fillRect(transformedX,transformedY,5,2)
            // ctx.fillRect(xAxisScale(x),yAxisScale(y),xsize,ysize)
        }
        else if(shape=="circle") {
            ctx.arc(transformedX,transformedY, radius, 0, 2 * Math.PI);            
        }

        else if(shape=="ellipse") {
            ctx.ellipse(transformedX, transformedY, 2,1,0,0,2 * Math.PI)

        }



    }


    function updatePlot(x=xMid, y=yMid, xsig=xSD, ysig=ySD,n=num){
        let url = `gauss?x=${xMid}&y=${yMid}&n=${n}&xSD=${xSD}&ySD=${ySD}`
        // let url = `gauss?x=${xMid}&y=${yMid}&n=${n}`
        console.log(url)
        console.log(svg)
        d3.json(url).then(function(data) {

            xRange = d3.extent(data, function(d) { return d.x });
            yRange = d3.extent(data, function(d) { return d.y });
            dataa = data
            counts = count(dataa)
            fractionOfCounts = getRandomSample(counts,Math.floor(counts.length*.25))

            // console.log(xRange)
            // console.log(yRange)

            fractionOfCounts.sort(function(a, b) {
                return a[1] - b[1];
            });

            // auto-center
            // xAxisScale.domain([xRange[0] - 5, xRange[1] + 5])
            // yAxisScale.domain([yRange[0] - 5, yRange[1] + 5])

            // Static scale
            // xAxisScale.domain([0, 1000])
            // yAxisScale.domain([0 ,1000])

            // adjust marker size
            // get_point_size()

            draw(d3.zoomIdentity, false)
          }).then(function(){
            ctx.textAlign = 'center'
            ctx.fillText("Title goes here", width/2, 10);
        })
        

        
    }


// //https://bl.ocks.org/git-ashish/bc614e2e2d41ab01ce1bc62849a5a54f
var zoomEndDelay = 150;
var zoomEndTimeout


const zoom_function = d3.zoom().scaleExtent([1, 1000])
  // when zooming, 
  .on('zoom', () => {
    clearTimeout(zoomEndTimeout);
    const transform = d3.event.transform;
    ctx.save();
    draw(transform, true);
    ctx.restore();
  })
  .on('end', () => {
    const transform = d3.event.transform;
    ctx.save();
    draw(transform)
    ctx.restore();
  })
  ;




// https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
function getRandomSample(array, count) {
    console.log(`Sampling down to ${count}`)
    var indices = [];
    var result = new Array(count);
    for (let i = 0; i < count; i++ ) {
        let j = Math.floor(Math.random() * (array.length - i) + i);
        result[i] = array[indices[j] === undefined ? j : indices[j]];
        indices[j] = indices[i] === undefined ? i : indices[i];
    }
    return result;
}