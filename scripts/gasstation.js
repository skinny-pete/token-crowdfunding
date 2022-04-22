//THIS SCRIPT WILL NOT RUN OUTSIDE OF BROWSER, USE THIS TO GET LATEST GAS RECOMMENDATIONS
//URL NEEDS TO BE THE GASSTATION FOR THE CHAIN YOU ARE USING

var res;

fetch("https://gasstation-mumbai.matic.today/v2")
    .then((response) => response.json())
    .then((fast) => (res = fast));

const _maxPriorityFee = res.fast.maxPriorityFee * 10 ** 9;
const _maxFee = res.fast.maxFee * 10 ** 9;

let overrides = {
    maxPriorityFee: _maxPriorityFee,
    maxFee: _maxFee,
};