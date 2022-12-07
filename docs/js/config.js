var A = {}

A.inputs = []
A.yMax = 4500000
A.compoundingPeriodsPerYear = 12

numeral.defaultFormat('$0,0')

/*
    Inputs    low high  Upfront $/Yr  $/Mo
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

var inputRent = {
  id: 'inputRent',
  label: 'Current Rent',
  type: 'text',
  class: 'hmh-input param',
  divClass: 'rent-component',
  step: 100,
  'data-format': '$0,0',
  value: numeral(3500).format(),
}
var inputHousePrice = {
  id: 'inputHousePrice',
  label: 'House Price',
  type: 'text',
  class: 'hmh-input param',
  divClass: 'house-component',
  step: 50000,
  'data-format': '$0,0',
  value: numeral(1000000).format(),
}
var inputDownPaymentPercent = {
  id: 'inputDownPaymentPercent',
  class: 'hmh-input param',
  divClass: 'house-component',
  label: 'Down Payment',
  step: 0.01,
  type: 'text',
  'data-format': '0%',
  value: numeral(20 / 100).format('0%'),
}

var inputMortgageRate = {
  id: 'inputMortgageRate',
  class: 'hmh-input param',
  divClass: 'house-component',
  label: 'Loan Rate',
  step: 0.001,
  type: 'text',
  'data-format': '0.0%',
  value: numeral(6 / 100).format('0.0%'),
}

var inputMortgageYears = {
  id: 'inputMortgageYears',
  class: 'hmh-input param',
  divClass: 'house-component',
  label: 'Loan term (yrs)',
  step: 0,
  type: 'text',
  'data-format': '0',
  value: 30,
}

var inputEstHouseGrowthRate = {
  id: 'inputEstHouseGrowthRate',
  class: 'hmh-input param',
  divClass: 'estimate',
  label: 'Estimate House Appreciation',
  step: 0.01,
  type: 'text',
  'check-uncertainty': true,
  'data-format': '0%',
  value: numeral(3 / 100).format('0%'),
}

var inputEstRentGrowthRate = {
  id: 'inputEstRentGrowthRate',
  class: 'hmh-input param',
  divClass: 'estimate',
  label: 'Estimate Rent Growth Rate',
  step: 0.01,
  type: 'text',
  'data-format': '0%',
  value: numeral(1 / 100).format('0%'),
}
var inputEstIndexFundReturnRate = {
  id: 'inputEstIndexFundReturnRate',
  class: 'hmh-input param',
  divClass: 'estimate',
  label: 'Estimate Index Fund Return Rate',
  step: 0.01,
  type: 'text',
  'data-format': '0%',
  'check-uncertainty': true,
  value: numeral(6 / 100).format('0%'),
}
var inputEstInflationRate = {
  id: 'inputEstInflationRate',
  class: 'hmh-input param',
  divClass: 'estimate',
  label: 'Estimate Inflation Rate',
  step: 0.01,
  type: 'text',
  'data-format': '0%',
  value: numeral(3.5 / 100).format('0%'),
}

var inputPropertyTaxRate = {
  // https://sftreasurer.org/property-taxes
  // https://www.sfassessor.org/sites/default/files/press-releases/Prop-13-Fact-sheet.pdf
  // increases by the inflation rate of the California Consumer Price Index (cap at 2%)
  id: 'inputPropertyTaxRate',
  class: 'hmh-input param',
  divClass: 'house-component',
  label: 'Property Tax Rate',
  step: 0.001,
  type: 'text',
  'data-format': '0.00%',
  value: numeral(1.17 / 100).format('0.00%'), // FY2018-2019 Property Tax Rate = 1.1630%
}
var inputInsuranceRate = {
  id: 'inputInsuranceRate',
  class: 'hmh-input param',
  divClass: 'house-component',
  label: 'Insurance Rate',
  step: 0.001,
  type: 'text',
  'data-format': '0.00%',
  value: numeral(0.13 / 100).format('0.00%'),
}

var inputMarginalTaxRate = {
  id: 'inputMarginalTaxRate',
  class: 'hmh-input param',
  divClass: 'estimate',
  label: 'Marginal Tax Rate (Fed + State)',
  step: 0.01,
  type: 'text',
  'data-format': '0%',
  value: numeral(40 / 100).format('0%'),
}

var inputClosingCostRate = {
  id: 'inputClosingCostRate',
  class: 'hmh-input param',
  divClass: 'house-component',
  label: 'Closing Cost',
  step: 0.01,
  type: 'text',
  'data-format': '0%',
  value: numeral(4 / 100).format('0%'),
}

var inputEstHomeImprovements = {
  id: 'inputEstHomeImprovements',
  class: 'hmh-input param',
  divClass: 'house-component',
  label: 'Home Improvements',
  step: 0.01,
  type: 'text',
  'data-format': '0%',
  value: numeral(1 / 100).format('0%'),
}

A.inputs = [
  inputRent,
  inputHousePrice,
  inputDownPaymentPercent,
  inputClosingCostRate,
  inputMortgageRate,
  inputMortgageYears,
  inputPropertyTaxRate,
  inputInsuranceRate,
  inputEstHomeImprovements,
  inputEstHouseGrowthRate,
  inputEstRentGrowthRate,
  inputEstIndexFundReturnRate,
  inputMarginalTaxRate,
  inputEstInflationRate,
]
