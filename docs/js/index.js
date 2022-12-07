/*
  https://www.khanacademy.org/economics-finance-domain/core-finance/housing/renting-v-buying/v/renting-vs-buying-a-home-part-2
  https://www.khanacademy.org/economics-finance-domain/core-finance/housing/renting-v-buying/v/renting-vs-buying-detailed-analysis
  https://www.khanacademy.org/downloads/buyrent.xls
*/

/*
    A.inputs    low high  Upfront $/Yr  $/Mo
  0 Location (lookup Buy/Rent ratio)
  1 Home Price (output?)  $1,000,000  $800,000  $1,200,000
  2 Staying how long? 15  4 30
  3 Mortgage Rate 3.60% 3.5 4.5   $68,952 $5,746
  4 Down Payment  20% 20% 20% $200,000
  5 Mortgage Length 15  15  15
  6 Estimate House Appreciation 3%  2%  5%
  7 Estimate Rent Growth Rate 2.5%  1%  4%
  8 Estimate Index Fund Return Rate 6%  2%  8%
  9 Estimate Inflation Rate 2%  1%  4%
  10  Property Tax  1.13% 1.13% 1.35%   $11,300 $942
  11  Marginal Tax Rate 40% 40% 40%
  12  Closing Cost - buying 4%  4%  4%  $40,000
  13  Closing Cost - selling  6%  6%  6%
  14  Maintenance 1%        $10,000 $833
  15  Insurance 0.13% 0.13% 0.5   $1,260  $105


*/

A.outputs = {}
A.yearCount = 40

initChart(A.yearCount)

A.inputs.forEach((x, xi) => {
  var div = document.createElement('div')
  div.setAttribute('class', x.divClass)

  div.innerHTML = `
    <label class="label-${x.class}">${xi + 1}. ${x.label}</label>

    <span class="plus translate-y-1">⌃</span>

    <input id="${x.id}" class="${x.class}" step="${x.step}" data-format="${
    x['data-format'] || ''
  }" name="quantity" value="${x.value}" type="${x.type}">

    <span class="minus inline-flex rotate-180">⌃</span>

    <label class="label-plus-minus">±</label>
    <input id="uncertainty-${x.id}" class="input-uncertainty" step="${
    x.step
  }" data-format="${
    x['data-format'] || ''
  }" name="uncertainty" value="${numeral(x.step).format(
    x['data-format']
  )}" type="${x.type}">

    <input type="checkbox" ${x['check-uncertainty'] ? 'checked' : 'disabled'}/>

  `

  document.querySelector('#input-wrapper').appendChild(div)
})

parseUrlParams()
calculateOutputs()

function calculateOutputs() {
  console.log('calculateOutputs')

  A.chartData = {}
  A.chartData.sceneA = []
  A.chartData.sceneB = []

  A.chartData.sceneAsimple = []
  A.chartData.sceneAsimple_lo = []
  A.chartData.sceneAsimple_hi = []
  A.chartData.sceneBsimple = []
  A.chartData.sceneBsimple_lo = []
  A.chartData.sceneBsimple_hi = []

  A.inputRent = numeral(document.querySelector('#inputRent').value)._value
  A.inputHousePrice = numeral(
    document.querySelector('#inputHousePrice').value
  )._value
  A.inputDownPaymentPercent = numeral(
    document.querySelector('#inputDownPaymentPercent').value
  )._value
  A.inputMortgageRate = numeral(
    document.querySelector('#inputMortgageRate').value
  )._value
  A.inputMortgageYears = numeral(
    document.querySelector('#inputMortgageYears').value
  )._value
  A.inputPropertyTaxRate = numeral(
    document.querySelector('#inputPropertyTaxRate').value
  )._value
  A.inputInsuranceRate = numeral(
    document.querySelector('#inputInsuranceRate').value
  )._value
  A.inputMarginalTaxRate = numeral(
    document.querySelector('#inputMarginalTaxRate').value
  )._value
  A.inputClosingCostRate = numeral(
    document.querySelector('#inputClosingCostRate').value
  )._value
  A.inputEstHomeImprovements = numeral(
    document.querySelector('#inputEstHomeImprovements').value
  )._value
  A.inputEstHouseGrowthRate = numeral(
    document.querySelector('#inputEstHouseGrowthRate').value
  )._value
  A.inputEstRentGrowthRate = numeral(
    document.querySelector('#inputEstRentGrowthRate').value
  )._value
  A.inputEstIndexFundReturnRate = numeral(
    document.querySelector('#inputEstIndexFundReturnRate').value
  )._value
  A.inputEstInflationRate = numeral(
    document.querySelector('#inputEstInflationRate').value
  )._value

  A.inputEstIndexFundReturnRateError = numeral(
    document.querySelector('#uncertainty-inputEstIndexFundReturnRate').value
  )._value
  A.inputEstHouseGrowthRateError = numeral(
    document.querySelector('#uncertainty-inputEstHouseGrowthRate').value
  )._value

  A.downPayment = A.inputHousePrice * A.inputDownPaymentPercent // / 100.0;
  A.DPCC =
    A.inputHousePrice * (A.inputDownPaymentPercent + A.inputClosingCostRate)
  // 824500 * 0.8, 4.112, 30, 12
  A.monthlyMortgagePI = loanPaymentPerPeriod(
    A.inputHousePrice - A.downPayment,
    A.inputMortgageRate,
    A.inputMortgageYears,
    A.CPPY
  )

  A.principalRemaining = A.inputHousePrice - A.downPayment
  A.runningTotalInterest = 0
  A.runningTotalPrincipal = A.downPayment

  // aHouse = futureValueLumpSum(A.inputHousePrice, A.inputEstHouseGrowthRate, A.inputMortgageYears, A.CPPY);

  // aCash = futureValueLumpSum();

  A.initialAnnualPropertyTax =
    A.inputPropertyTaxRate * (A.inputHousePrice - 7000) // one-time Homeowner's Exemption
  A.initialAnnualInsurance = A.inputInsuranceRate * A.inputHousePrice

  // bCash = futureValueLumpSum(A.DPCC, A.inputEstIndexFundReturnRate, A.inputMortgageYears, A.CPPY);
  // bCash += futureValueAnnuity(thisMonthsDiff, A.inputEstIndexFundReturnRate, A.inputMortgageYears, A.CPPY);

  /*
  A.dataSeries = {};
  A.dataSeries.cash = [A.DPCC, bCash];
  A.dataSeries.house = [A.DPCC, aHouse];
*/
  // updateChart(A.dataSeries.cash, A.dataSeries.house);
  createMonthlySums()
  writeFinalOutputs()
  // debugger;
}

function equityAppreciationPart(equityPercent, principalPaid, marketValue) {
  // The theoretical equity $ assuming new market value:
  equityAssumingNewMarketValue = equityPercent * marketValue
  return equityAssumingNewMarketValue - principalPaid
}

function createMonthlySums() {
  console.log('createMonthlySums')
  /*
    https://bl.ocks.org/mjfoster83/7c9bdfd714ab2f2e39dd5c09057a55a0
    Stacked Bar chart: Show as: What happens to $200k + $4000/mo over the years:

  https://homeguides.sfgate.com/calculate-principal-interest-mortgage-2409.html
    Interest each month is always calculated on the remaining principal (not the monthly payment):
    e.g. $417,000 * 0.00416 = $1,735
    First month:

  */

  A.qumePropertyTax = 0
  A.qumeLoanInterest = 0
  A.qumeInsurance = 0
  A.qumeMaintenance = 0
  A.qumeTaxSavings = 0
  A.qumeRent = 0

  A.chartData.sceneA = []
  A.chartData.sceneB = []

  // for (var i = 0; i < (12 * (A.inputMortgageYears + 10) + 0); i += 1) {
  for (var i = 0; i < 12 * A.yearCount + 0; i += 1) {
    // yrs = 12 * i;
    thisMonthsPropTax =
      (Math.pow(1.02, i / 12) * A.initialAnnualPropertyTax) / 12
    thisMonthsInsurance =
      (Math.pow(1 + A.inputEstInflationRate, i / 12) *
        A.initialAnnualInsurance) /
      12

    thisMonthsRent =
      Math.pow(1 + A.inputEstRentGrowthRate, i / 12) * A.inputRent
    // newRent = futureValueLumpSum(A.inputRent, A.inputEstRentGrowthRate, i/12, A.CPPY);

    if (A.principalRemaining <= 0) {
      thisMonthsInterest = 0
      thisMonthsPrincipal = 0
      // A.monthlyTotal_TaxInsMortPI = Do tax & insurance go up each year?
      // At this point, P&I payments cease; monthlyDiff changes sign;
      // End annuity deposits for rental situation?
      // Or just make extra large for buy/bought situation?
    } else {
      // First: how much of the constant payment is for interest?
      thisMonthsInterest = (A.inputMortgageRate / 12) * A.principalRemaining
      thisMonthsPrincipal = A.monthlyMortgagePI - thisMonthsInterest

      thisMonthsMaintenance =
        (A.inputEstHomeImprovements * A.inputHousePrice) / 12

      thisMonthsTaxSavings =
        (thisMonthsInterest + thisMonthsPropTax) * A.inputMarginalTaxRate

      thisMonthsTotal_TaxInsMortPI =
        thisMonthsPrincipal +
        thisMonthsInterest +
        thisMonthsPropTax +
        thisMonthsInsurance
      if (i === 0) A.monthlyTotal_TaxInsMortPI = thisMonthsTotal_TaxInsMortPI

      thisMonthsDiff =
        thisMonthsTotal_TaxInsMortPI +
        thisMonthsMaintenance -
        thisMonthsRent -
        thisMonthsTaxSavings

      console.log(
        'MortgagePI,PropTax,Ins,Maint',
        Math.round(thisMonthsTotal_TaxInsMortPI + thisMonthsMaintenance)
      )
      console.log('IncomeTaxSavings', Math.round(thisMonthsTaxSavings))
      console.log('Rent', Math.round(thisMonthsRent))
      console.log(
        'Payment - Rent - TaxSave',
        Math.round(
          thisMonthsTotal_TaxInsMortPI +
            thisMonthsMaintenance -
            thisMonthsRent -
            thisMonthsTaxSavings
        )
      )
      console.log('thisMonthsDiff', Math.round(thisMonthsDiff))
      console.log('---')

      // What's the new principal?
      A.principalRemaining -= thisMonthsPrincipal

      // Running total of interest, principal
      A.runningTotalInterest += thisMonthsInterest
      A.runningTotalPrincipal += thisMonthsPrincipal

      // The house's new market value:
      A.houseMarketValue = futureValueLumpSum(
        A.inputHousePrice,
        A.inputEstHouseGrowthRate,
        i / 12,
        A.CPPY
      )
      houseMarketValue_hi = futureValueLumpSum(
        A.inputHousePrice,
        A.inputEstHouseGrowthRate + A.inputEstHouseGrowthRateError,
        i / 12,
        A.CPPY
      )
      houseMarketValue_lo = futureValueLumpSum(
        A.inputHousePrice,
        A.inputEstHouseGrowthRate - A.inputEstHouseGrowthRateError,
        i / 12,
        A.CPPY
      )

      // The percent equity: owned / total =
      A.equityPercent =
        (A.inputHousePrice - A.principalRemaining) / A.inputHousePrice

      // The theoretical equity $ assuming new market value:
      A.equityAssumingNewMarketValue = A.equityPercent * A.houseMarketValue

      // The two different parts of that equity:
      A.pos_Equity_From_Principal = A.inputHousePrice - A.principalRemaining
      A.pos_Equity_From_Appreciation =
        A.equityAssumingNewMarketValue - A.pos_Equity_From_Principal

      A.qumePropertyTax += thisMonthsPropTax
      A.qumeLoanInterest += thisMonthsInterest
      A.qumeInsurance += thisMonthsInsurance
      A.qumeMaintenance += (A.inputEstHomeImprovements * A.inputHousePrice) / 12
      A.qumeTaxSavings += thisMonthsTaxSavings
      A.qumeRent += thisMonthsRent

      if ((i + 1) % 12 === 0) {
        A.equity = Math.round(
          A.runningTotalPrincipal + A.pos_Equity_From_Appreciation
        )
        A.equity_hi = Math.round(
          A.runningTotalPrincipal +
            equityAppreciationPart(
              A.equityPercent,
              A.pos_Equity_From_Principal,
              houseMarketValue_hi
            )
        )
        A.equity_lo = Math.round(
          A.runningTotalPrincipal +
            equityAppreciationPart(
              A.equityPercent,
              A.pos_Equity_From_Principal,
              houseMarketValue_lo
            )
        )

        var investRate = A.inputEstIndexFundReturnRate
        var investRate_hi =
          A.inputEstIndexFundReturnRate + A.inputEstIndexFundReturnRateError
        var investRate_lo =
          A.inputEstIndexFundReturnRate - A.inputEstIndexFundReturnRateError

        A.invest = Math.round(
          futureValueAnnuity(thisMonthsDiff, investRate, i / 12, A.CPPY) +
            futureValueLumpSum(A.DPCC, investRate, i / 12, A.CPPY)
        )
        A.invest_hi = Math.round(
          futureValueAnnuity(thisMonthsDiff, investRate_hi, i / 12, A.CPPY) +
            futureValueLumpSum(A.DPCC, investRate_hi, i / 12, A.CPPY)
        )
        A.invest_lo = Math.round(
          futureValueAnnuity(thisMonthsDiff, investRate_lo, i / 12, A.CPPY) +
            futureValueLumpSum(A.DPCC, investRate_lo, i / 12, A.CPPY)
        )

        A.chartData.sceneAsimple.push(A.equity)
        A.chartData.sceneAsimple_hi.push(A.equity_hi)
        A.chartData.sceneAsimple_lo.push(A.equity_lo)
        A.chartData.sceneBsimple.push(A.invest)
        A.chartData.sceneBsimple_hi.push(A.invest_hi)
        A.chartData.sceneBsimple_lo.push(A.invest_lo)

        A.chartData.sceneA.push({
          monthsCompleted: i,
          // "yearsCompleted": Math.round(100 * i/12)/100,
          misc_newHouseValue: Math.round(A.houseMarketValue),
          // "pos_DPCC_initial": A.DPCC, // constant over series
          pos_Equity_From_Principal: Math.round(A.runningTotalPrincipal),
          pos_Equity_From_Appreciation: Math.round(
            A.pos_Equity_From_Appreciation
          ),
          pos_Tax_Savings: A.qumeTaxSavings,
          neg_Loan_Interest: Math.round(A.runningTotalInterest),
          neg_Property_Tax: A.qumePropertyTax,
          neg_Insurance: A.qumeInsurance,
          'neg_Maintenance_/_Improvements': A.qumeMaintenance,
        })

        A.chartData.sceneB.push({
          monthsCompleted: i,
          // "yearsCompleted": i/12,
          pos_DPCC_initial: A.DPCC,
          pos_deposit: thisMonthsDiff,
          'pos_Recurring_Deposits_+_Growth': futureValueAnnuity(
            thisMonthsDiff,
            A.inputEstIndexFundReturnRate,
            i / 12,
            A.CPPY
          ),
          'pos_First_Deposit_+_Growth': futureValueLumpSum(
            A.DPCC,
            A.inputEstIndexFundReturnRate,
            i / 12,
            A.CPPY
          ),
          // "neg_Rent": A.inputRent,
          neg_Rent: A.qumeRent,
        })

        console.log(thisMonthsDiff)

        // console.log(futureValueAnnuity(thisMonthsDiff, A.inputEstIndexFundReturnRate, i/12, A.CPPY));
      }
    }
  }

  // GOOD:
  updateChartArea(
    A.chartData.sceneAsimple,
    A.chartData.sceneAsimple_hi,
    A.chartData.sceneAsimple_lo,
    A.chartData.sceneBsimple,
    A.chartData.sceneBsimple_hi,
    A.chartData.sceneBsimple_lo
  )

  // updateChart( A.chartData.sceneAsimple, A.chartData.sceneBsimple, A.chartData.sceneBsimple_hi, A.chartData.sceneBsimple_lo );

  updateChart2(A.chartData.sceneA, A.chartData.sceneB)
}

function writeFinalOutputs() {
  A.outputs.sceneA = [
    {
      class: 'hmh-output',
      label: 'Down Payment',
      step: 1,
      type: 'text',
      value: numeral(A.downPayment).format(),
    },
    {
      class: 'hmh-output',
      label: 'Closing Cost',
      step: 1,
      type: 'text',
      value: numeral(A.inputClosingCostRate * A.inputHousePrice).format(),
    },
    {
      class: 'hmh-output',
      label: 'Monthly Payment',
      step: 1,
      type: 'text',
      value: numeral(A.monthlyTotal_TaxInsMortPI).format(),
    },
    {
      class: 'hmh-output',
      label: 'Price-to-Rent Ratio',
      step: 1,
      type: 'text',
      value: numeral(A.inputHousePrice / (12 * A.inputRent)).format('0'),
    },
    {
      class: 'hmh-output',
      divClass: 'final-home',
      id: 'final-home',
      label: 'Home Value @30yr',
      step: 1,
      type: 'text',
      value: numeral(Math.round(A.equity / 1000) * 1000).format(),
      //"value": numeral(A.equity).format(),
    },
  ]

  A.outputs.sceneB = [
    {
      class: 'hmh-output',
      divClass: 'final-cash',
      id: 'final-cash',
      label: 'Investments @30yr',
      step: 1,
      type: 'text',
      value: numeral(Math.round(A.invest / 1000) * 1000).format(),
    },
  ]

  document.querySelector('#output-wrapper').innerHTML = ''
  A.outputs.sceneA.forEach((x, xi) => {
    var div = document.createElement('div')
    div.setAttribute('class', x.divClass)
    div.innerHTML = `
      <label class="label-${x.class}">${x.label}</label>
      <span id="${x.id}" class="${x.class}" min="0" step="${x.step}" name="quantity" value="${x.value}" type="${x.value}">
      ${x.value}
      </span>
    `
    document.querySelector('#output-wrapper').appendChild(div)
  })

  A.outputs.sceneB.forEach((x, xi) => {
    var div = document.createElement('div')
    div.setAttribute('class', x.divClass)
    div.innerHTML = `
      <label class="label-${x.class}">${x.label}</label>
      <span id="${x.id}" class="${x.class}" min="0" step="${x.step}" name="quantity" value="${x.value}" type="${x.value}">
      ${x.value}
      </span>
    `
    document.querySelector('#output-wrapper').appendChild(div)
  })

  d3.select('div.final-home')
    .append('span')
    .attr('class', 'est-final')
    .text(
      '±' +
        numeral(
          Math.round((A.equity_hi - A.equity_lo) / 2 / 1000) * 1000
        ).format()
    )
  d3.select('div.final-cash')
    .append('span')
    .attr('class', 'est-final')
    .text(
      '±' +
        numeral(
          Math.round((A.invest_hi - A.invest_lo) / 2 / 1000) * 1000
        ).format()
    )

  formatUrlParams()
}

initialValue = 200000
CPPY = 12
nominalInterestRate = 6.0
periodicInterestRate = nominalInterestRate / CPPY
years = 15
compoundingPeriods = CPPY * years
depositPerPeriod = 2000

function futureValueAnnuity(
  depositPerPeriod,
  nominalInterestRate,
  years,
  CPPY
) {
  d = depositPerPeriod
  r = nominalInterestRate // / 100.0;
  y = years
  n = CPPY || 12
  i = r / n
  t = n * y

  var rateTimeFactor = ((Math.pow(1 + i, t) - 1) / i) * (1 + i)

  return d * rateTimeFactor
}
/*
  futureValueAnnuity(2000, 6.0, 15, 12)
  584,545
*/

function futureValueLumpSum(initialValue, nominalInterestRate, years, CPPY) {
  p = initialValue
  r = nominalInterestRate // / 100.0;
  y = years
  n = CPPY || 12
  i = r / n
  t = n * y
  return p * Math.pow(1 + i, t)
}
/*
  futureValueLumpSum(200000, 4, 15, 12)
  364,060
*/

function loanPaymentPerPeriod(initialValue, nominalInterestRate, years, CPPY) {
  p = initialValue
  r = nominalInterestRate // / 100.0;
  y = years
  n = CPPY || 12
  rn = r / n
  yn = n * y
  return (p * Math.pow(1 + rn, yn) * rn) / (Math.pow(1 + rn, yn) - 1)
}
/*
  loanPaymentPerPeriod(824500 * 0.8, 4.112, 30, 12);
  3192
  3192 * 12 * 30 =
  1,149,120
  1149120 / (824500 * 0.8) =
  1.74
*/

/*
https://www.zillow.com/homes/for_sale/2084873006_zpid/500000-950000_price/1951-3707_mp/globalrelevanceex_sort/37.777126,-122.377439,37.719575,-122.449536_rect/13_zm/
824,500
20% down
$4,240: Estimated monthly cost
$3,192/mo: Principal & interest
0.67 A.inputPropertyTaxRate (5524 / year)
0.0042 Insurance (3463 / year)
*/

document.addEventListener(
  'click',
  function (e) {
    // https://gomakethings.com/why-event-delegation-is-a-better-way-to-listen-for-events-in-vanilla-js/

    if (e.target.matches('span.plus')) {
      // get the value, step, and format
      var input = e.target.parentNode.querySelector('input')
      var step = input.getAttribute('step')
      var dataFormat = input.getAttribute('data-format')
      var num = numeral(input.value)._value + numeral(step)._value
      // numeral(20/100).format('0.0%')
      console.log(numeral(input.value), step, num)
      input.value = numeral(num).format(dataFormat)
      calculateOutputs()
    }

    if (e.target.matches('span.minus')) {
      // get the value, step, and format
      var input = e.target.parentNode.querySelector('input')
      var step = input.getAttribute('step')
      var dataFormat = input.getAttribute('data-format')
      var num = numeral(input.value)._value - numeral(step)._value
      // numeral(20/100).format('0.0%')
      console.log(numeral(input.value), step, num)
      input.value = numeral(num).format(dataFormat)
      calculateOutputs()
    }

    if (e.target.matches('input.hmh-input')) {
      calculateOutputs()
    }
  },
  false
)

document.addEventListener(
  'input',
  function (e) {
    if (e.target.matches('input.hmh-input')) {
      calculateOutputs()
    }

    if (e.target.matches('input.input-uncertainty')) {
      calculateOutputs()
    }

    // if (e.target.matches('.properties-list-item A.input')) {
    if (e.target.closest('.properties-list-item')) {
      // initHistogram();
    }
  },
  false
)
