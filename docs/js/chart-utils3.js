/*
  https://bl.ocks.org/mbostock/882152
  https://observablehq.com/@d3/grouped-bar-chart
  https://bl.ocks.org/NGuernse/3b060295b62f69dc8709d2013f037590
  Essential: https://bl.ocks.org/ricardo-marino/ca2db3457f82dbb10a8753ecba8c0029
  https://stackoverflow.com/questions/29286170/how-to-correctly-transition-stacked-bars-in-d3-js#29324800
  https://bl.ocks.org/guilhermesimoes/8913c15adf7dd2cab53a
  TODO: https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91
*/

var margin = { top: 20, right: 80, bottom: 30, left: 20 },
  width = 1500 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom

var xScaleLinear = d3
  .scaleLinear()
  .range([0, width])
  .nice()
var yScaleLinear = d3
  .scaleLinear()
  .range([height, 0])
  .nice()

// xScaleBand = d3.scaleBand().rangeRound([0, width]).padding(.65);
// xScaleBand = d3.scaleBand().range([0, width]).padding(0.5);
xScaleBand = d3.scaleBand().range([0, width])
// yScaleLinear = d3.scaleLinear().rangeRound([height, 0]);
A.bandwidthFraction = 0.35

// var zScaleOrdinal = d3.scaleOrdinal().range(d3.schemeSpectral[9]);
var zScaleOrdinal = d3
  .scaleOrdinal()
  .range(['#eee', '#ddd', '#ccc'].concat(d3.schemeSpectral[9]))

spectral9 = [
  '#d53e4f',
  '#f46d43',
  '#fdae61',
  '#fee08b',
  '#ffffbf',
  '#e6f598',
  '#abdda4',
  '#66c2a5',
  '#3288bd'
]

var area = d3
  .area()
  .x((d, di) => Math.round(xScaleLinear(di)))
  .y1(d => Math.round(yScaleLinear(d)))
// Prep the toltp bits, initial display is hidden
var toltp

function initChart(bandCount) {
  console.log('initChart')

  var whichMonthsCharted = [...Array(bandCount).keys()].map(
    x => 12 * (x + 1) - 1
  )
  xScaleBand.domain(whichMonthsCharted)

  remainingSpace = (1 - 2 * A.bandwidthFraction) * xScaleBand.bandwidth()
  indent = 0.5 * remainingSpace

  var svg = d3
    .select('body')
    .append('div')
    .attr('id', 'div-for-svg-chart')
    .append('svg')
    .attr('id', 'hoh-chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  var svgG = svg
    .append('g')
    // .attr("id", "hmh-g-area-line-chart")
    .attr('id', 'hmh-g-area-line-chart')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  svg.append('g').attr('id', 'legend')

  svgG
    .append('path')
    .attr('id', 'data-a-area')
    .attr('class', 'area')

  svgG
    .append('path')
    .attr('id', 'data-b-area')
    .attr('class', 'area')

  svgG
    .append('path')
    .attr('id', 'data-a-line')
    .attr('class', 'line')

  svgG
    .append('path')
    .attr('id', 'data-b-line')
    .attr('class', 'line')

  svg
    .append('g')
    .attr('id', 'data-a-stacked-bars')
    .attr('class', 'stacked')
    .attr(
      'transform',
      'translate(' + (margin.left + indent) + ',' + margin.top + ')'
    )
  // .attr("transform", "translate(0," + margin.top + ")")

  svg
    .append('g')
    .attr('id', 'data-b-stacked-bars')
    .attr('class', 'stacked')
    // .attr("transform", `translate(${margin.left + 17}, ${margin.top})`)
    .attr('transform', d => {
      return `translate(${margin.left +
        indent +
        A.bandwidthFraction * xScaleBand.bandwidth() +
        4}, ${margin.top})`
    })

  // Add the axes
  axesG = svg
    .append('g')
    .attr('id', 'chart-axes')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  axesG
    .append('g')
    .attr('id', 'x-b-axis')
    .attr('transform', 'translate(0,' + height + ')')

  axesG
    .append('g')
    .attr('id', 'y-r-axis')
    .attr('transform', `translate(${width}, 0)`)

  // toltp = svg.append("g")
  toltp = d3
    .select('body')
    .append('div')
    .attr('class', 'toltp')
    .style('display', 'none')

  // Add toggle buttons for chart type
  d3.select('#div-for-svg-chart')
    .append('div')
    .attr('id', 'toggle-wrapper')
    .selectAll('a.toggle-chart')
    .data(['chart-bar', 'chart-line'])
    .enter()
    .append('a')
    .attr('id', d => `a-${d}`)
    .on('mouseover', d => {
      console.log(d)
      if (d === 'chart-bar') {
        d3.selectAll('#data-a-stacked-bars,#data-b-stacked-bars')
          .transition()
          .duration(400)
          .style('opacity', 1)
        d3.select('#legend')
          .transition()
          .duration(400)
          .style('opacity', 1)
        d3.select('#hmh-g-area-line-chart')
          .transition()
          .duration(400)
          .style('opacity', 0)
        d3.select('#toltp')
          .transition()
          .duration(400)
          .style('opacity', 1)
        d3.select('#a-chart-bar').classed('active', true)
        d3.select('#a-chart-line').classed('active', false)
      } else {
        d3.selectAll('#data-a-stacked-bars,#data-b-stacked-bars')
          .transition()
          .duration(400)
          .style('opacity', 0)
        d3.select('#legend')
          .transition()
          .duration(400)
          .style('opacity', 0)
        d3.select('#hmh-g-area-line-chart')
          .transition()
          .duration(400)
          .style('opacity', 1)
        d3.select('#toltp')
          .transition()
          .duration(400)
          .style('opacity', 0)
        d3.select('#a-chart-bar').classed('active', false)
        d3.select('#a-chart-line').classed('active', true)
      }
    })
    .attr('class', 'toggle-chart')
    .append('i')
    .attr('class', d => `fas fa-fw fa-${d}`)
}

function updateChartArea(aData, aData_hi, aData_lo, bData, bData_hi, bData_lo) {
  console.log('updateChartArea')

  var xMax = Math.max(aData.length, bData.length)
  var yMax = Math.max(
    ...aData
      .concat(bData)
      .concat(aData_hi)
      .concat(bData_hi)
  )

  // Scale the range of the data
  xScaleLinear.domain([0, xMax])
  yScaleLinear.domain([0, A.yMax])

  // define the line
  var valueline = d3
    .line()
    .x((d, di) => xScaleLinear(di))
    .y(d => yScaleLinear(d))
  a_hiLoData = []
  aData_hi.forEach((x, xi) => {
    a_hiLoData.push({ hi: x, lo: aData_lo[xi] })
  })

  b_hiLoData = []
  bData_hi.forEach((x, xi) => {
    b_hiLoData.push({ hi: x, lo: bData_lo[xi] })
  })

  var svgG = d3.select('#hmh-g-area-line-chart')

  svgG
    .select('#data-a-area')
    .data([a_hiLoData])
    .transition()
    .duration(1000)
    .attr(
      'd',
      d3
        .area()
        .x(function(d, di) {
          return xScaleLinear(di)
        })
        .y0(d => yScaleLinear(d.lo))
        .y1(d => yScaleLinear(d.hi))
    )
  // .exit()
  // .remove()

  svgG
    .select('#data-b-area')
    .data([b_hiLoData])
    .transition()
    .duration(1000)
    .attr(
      'd',
      d3
        .area()
        .x(function(d, di) {
          return xScaleLinear(di)
        })
        .y0(d => yScaleLinear(d.lo))
        .y1(d => yScaleLinear(d.hi))
    )

  // Add the valueline path.
  svgG
    .select('#data-a-line')
    .data([aData])
    .transition()
    .duration(1000)
    .attr('d', valueline)

  svgG
    .select('#data-b-line')
    .data([bData])
    .transition()
    .duration(1000)
    .attr('d', valueline)

  console.log('xMax', xMax)

  d3.select('#x-b-axis').call(d3.axisBottom(xScaleLinear).ticks(xMax))
  d3.select('#y-r-axis').call(d3.axisRight(yScaleLinear))
} // updateChartArea

createLegend = svg => {
  // const g = svg

  svg.select('#legend').html('') // hack?

  const g = svg
    .select('#legend')
    .attr('transform', `translate(${width * 0.6},0)`)
    // .attr("text-anchor", "end")
    .attr('font-family', 'sans-serif')
    .attr('font-size', 13)
    .selectAll('g')
    // .data( Object.values(A.colorLookup).slice().reverse())
    .data(
      Object.values(A.colorLookup)
        .slice()
        .reverse(),
      d => {
        // return d;
        // return d.key; // undefined
        return 1
      }
    )
    .join('g')
    .attr('transform', (d, i) => `translate(0,${i * 20})`)
  g.append('rect')
    .attr('x', -19)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', d => d)

  g.append('text')
    .attr('x', 9)
    .attr('y', 9.5)
    .attr('dy', '0.35em')
    .text(d => parseKey(A.keynameLookup[d]))
}

grays = ['#fefefe', '#fdfdfd', '#fcfcfc', '#fbfbfb', '#fafafa']

A.colorLookup = {
  // "pos_Equity_From_Principal": "#A0D0E0",
  pos_Equity_From_Principal: '#6ea8bb',
  // "pos_Equity_From_Appreciation": "#AaDdEe",
  pos_Equity_From_Appreciation: '#80cdc1',
  // "pos_Tax_Savings": "#CBE1EE",
  pos_Tax_Savings: '#b6ddd7',
  neg_Loan_Interest: grays[0],
  neg_Property_Tax: grays[1],
  neg_Insurance: grays[2],
  'neg_Maintenance_/_Improvements': grays[3]
}

// A.colorLookup["pos_First_Deposit_+_Growth"] = "#FDA460";
A.colorLookup['pos_First_Deposit_+_Growth'] = '#e3a270'
A.colorLookup['pos_Recurring_Deposits_+_Growth'] = '#FDB279'
A.colorLookup['neg_Rent'] = grays[4]

A.keynameLookup = {}
Object.keys(A.colorLookup).forEach((k, ki) => {
  A.keynameLookup[A.colorLookup[k]] = k
})

function updateChart2(aData, bData) {
  A.aData = aData

  var aKeys = Object.keys(aData[0])
  aKeys = [
    'pos_Equity_From_Principal',
    'pos_Equity_From_Appreciation',
    'pos_Tax_Savings',
    'neg_Loan_Interest',
    'neg_Property_Tax',
    'neg_Insurance',
    'neg_Maintenance_/_Improvements'
  ]
  bKeys = [
    'pos_First_Deposit_+_Growth',
    'pos_Recurring_Deposits_+_Growth',
    'neg_Rent'
  ]

  A.aKeys = aKeys // ["monthsCompleted", "yearsCompleted", "misc_newHouseValue", "pos_Equity_From_Principal", "pos_Equity_From_Appreciation", "pos_Tax_Savings", "neg_Loan_Interest", "neg_Property_Tax", "neg_Insurance", "neg_Maintenance"]

  // Scale the range of the data
  // xScaleBand.domain([0, xMax]);
  // yScaleLinear.domain([0, yMax]);
  //var xMax = Math.max(aData.length, bData.length);
  var xMax = Math.max(aData.length)

  var arrN = [...Array(A.yearCount).keys()]

  yScaleLinear.domain([0, A.yMax]).nice()
  // xScaleBand.domain([0, A.yearCount]);
  // xScaleBand.domain(arrN);
  xScaleBand.domain(
    aData.map(function(d) {
      return d.monthsCompleted
    })
  )
  // yScaleLinear.domain([0, d3.max(aData, function(d) { return d.misc_newHouseValue; })]).nice();

  var SERIES = d3.stack().keys(aKeys)(aData)

  SERIES.forEach((x, xi) => {
    x.forEach((y, yi) => {
      SERIES[xi][yi].key = yi + 1 + ''
    })
  })
  // 7-element array; each an array having 30 elements
  // document.querySelectorAll('rect')
  // NodeList(310)
  // after increment NodeList(320)...330...

  // set up the data for the groups
  const barSections = d3
    .select('g#data-a-stacked-bars')
    .selectAll('g')
    // .data(d3.stack().keys(aKeys)(aData))
    .data(SERIES)
  // enter and append the groups (including merge)
  // and prep the rects
  const bars = barSections
    .enter()
    .append('g')
    .merge(barSections)
    // .attr("class", "g-stack")
    .attr('data-category', d => d.key)
    .attr('fill-opacity', 0.97)
    .attr('class', function(d) {
      prefix = d.key.split('_')[0]
      return prefix + ' ' + A.colorLookup[d.key].replace('#', '')
      // return A.colorLookup[d.key];
    })
    .selectAll('rect')
    // .data(function(d) { return d; })
    .data(
      d => d,
      d => d.key
    )
  // enter and append the rects
  const enterBars = bars
    .enter()
    .append('rect')
    .attr('x', function(d) {
      return xScaleBand(d.data.monthsCompleted)
    })
    .attr('y', function(d) {
      return yScaleLinear(d[1])
    })
    .attr('height', function(d) {
      return yScaleLinear(d[0]) - yScaleLinear(d[1])
    })
    .attr('width', A.bandwidthFraction * xScaleBand.bandwidth())
  bars.exit().remove()

  enterBars
    .merge(bars)
    .transition()
    .duration(500)
    // .delay((d,i)=> i * 50)
    .attr('x', function(d) {
      return xScaleBand(d.data.monthsCompleted)
    })
    .attr('y', function(d) {
      return yScaleLinear(d[1])
    })
    .attr('height', function(d) {
      return yScaleLinear(d[0]) - yScaleLinear(d[1])
    })
    .attr('width', A.bandwidthFraction * xScaleBand.bandwidth())

  enterBars
    .on('mouseover', function() {
      if (d3.select('#a-chart-bar').classed('active')) {
        toltp.style('display', null)
      }
    })
    .on('mouseout', function() {
      toltp.style('display', 'none')
    })
    .on('mousemove', moveTooltip)

  var SERIES_B = d3.stack().keys(bKeys)(bData)

  SERIES_B.forEach((x, xi) => {
    x.forEach((y, yi) => {
      SERIES_B[xi][yi].key = yi + 1 + ''
    })
  })

  // set up the data for the groups
  const barSectionsB = d3
    .select('g#data-b-stacked-bars')
    .selectAll('g')
    // .data(d3.stack().keys(aKeys)(aData))
    .data(SERIES_B)
  // enter and append the groups (including merge)
  // and prep the rects
  const barsB = barSectionsB
    .enter()
    .append('g')
    .merge(barSectionsB)
    //.attr("class", "g-stack")
    // .attr("data-category", d => d.key.split('_')[1])
    .attr('data-category', d => d.key)
    .attr('fill-opacity', 0.87)
    .attr('class', function(d) {
      prefix = d.key.split('_')[0]
      return prefix + ' ' + A.colorLookup[d.key].replace('#', '')
      // return A.colorLookup[d.key];
    })
    .selectAll('rect')
    // .data(function(d) { return d; })
    .data(
      d => d,
      d => d.key
    )
  // enter and append the rects
  const enterBarsB = barsB
    .enter()
    .append('rect')
    .attr('x', function(d) {
      return xScaleBand(d.data.monthsCompleted)
    })
    .attr('y', function(d) {
      return yScaleLinear(d[1])
    })
    .attr('height', function(d) {
      return yScaleLinear(d[0]) - yScaleLinear(d[1])
    })
    .attr('width', A.bandwidthFraction * xScaleBand.bandwidth())
  barsB.exit().remove()

  enterBarsB
    .merge(barsB)
    .transition()
    .duration(500)
    .attr('x', function(d) {
      return xScaleBand(d.data.monthsCompleted)
    })
    .attr('y', function(d) {
      return yScaleLinear(d[1])
    })
    .attr('height', function(d) {
      return yScaleLinear(d[0]) - yScaleLinear(d[1])
    })
    .attr('width', A.bandwidthFraction * xScaleBand.bandwidth())

  enterBarsB
    .on('mouseover', function() {
      if (d3.select('#a-chart-bar').classed('active')) {
        toltp.style('display', null)
      }
    })
    .on('mouseout', function() {
      toltp.style('display', 'none')
    })
    .on('mousemove', moveTooltip)

  // svgG.append("g").call(legend);
  d3.select('svg#hoh-chart').call(createLegend)

  // d3.select('#x-b-axis').call(d3.axisBottom(xScaleLinear));
  d3.select('#y-r-axis').call(d3.axisRight(yScaleLinear))
} // updateChart2

function moveTooltip(d, di) {
  console.log('moveTooltip')
  var xPosition = d3.mouse(this)[0] - 5
  var yPosition = d3.mouse(this)[1] - 5
  toltp.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')')

  document.querySelector('.toltp').style.top = yPosition + 50 + 'px'
  // document.querySelector('.toltp').style.left = (xPosition - 121) + "px";
  document.querySelector('.toltp').style.left = xPosition - 180 + 'px'

  money = numeral(d[1] - d[0]).format()
  // parentFill = this.parentNode.getAttribute('fill');
  // parentFill = this.parentNode.style.fill;
  // category = A.keynameLookup[parentFill] || 'fee';
  category = this.parentNode.getAttribute('data-category') || 'fee'

  // console.log(d,di);

  // toltp.text(d.key + ". " + money + " " + parseKey(category));
  toltp.html(money + '<br/>' + parseKey(category))
}

function invertScaleOrdinal(theScale, output) {
  dom = theScale.domain()
  ran = theScale.range()
  return dom[d3.bisect(ran, output) - 1] || null
}

function parseKey(k) {
  k = k.split('_')
  prefix = k.shift()
  return k.join(' ')
}
