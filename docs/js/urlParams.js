// http://localhost:8000/misc/io/hmh/src/index.html#a=1&b=2

function formatUrlParams() {
  /*
    params = {
      a: 1,
      b: 2
    }
  */
  paramsArr = [];
  paramsEls = document.querySelectorAll('input.param');
  paramsEls.forEach(x => {
    par = x.getAttribute('id');
    val = x.value;
    paramsArr.push(par + '=' + val);
  })
  hash = '#' + paramsArr.join('&');
  window.location.hash = hash;
}

function parseUrlParams() {
  try {
    // substr(from, [to])
    params = {};
    hash = window.location.hash;
    // if (hash.substr(1) === '#'); // ['a=1', 'b=2']
    paramsArr = window.location.hash.substr(1).split('&'); // ['a=1', 'b=2']
    // if (paramsArr.length > 0) {
    paramsArr.forEach(x => {
        par = x.split('=')[0];
        val = x.split('=')[1];
        // params[par] = val;
        document.querySelector(`#${par}`).value = val;
    })

  } catch(e) {
    console.log('No window.location.hash')
  }

}
