/**
 * Creează un șir de caractere alfanumerice ASCII format din cifre și litere mari și mici.
 * @type {string} // Un sir de caractere 
 */

sirAlphaNum="";


/**
 * Array-ul de intervale pentru cifre și litere.
 * @type {Array<Array<number>>}
 */

//array-uri de numere 
v_intervale=[[48,57],[65,90],[97,122]]
for(let interval of v_intervale){
    for(let i=interval[0]; i<=interval[1]; i++)
    //codurile ascii
    //transforma codul ascii in caracter 
        sirAlphaNum+=String.fromCharCode(i)
}

console.log(sirAlphaNum);
/**
 * Generează un token format din caractere alese aleatoriu din șirul de caractere sirAlphaNum.
 * @param {number} n - Lungimea token-ului.
 * @returns {string} - Token-ul generat.
 */
function genereazaToken(n){
    let token=""
    //luam pe rand fiecare caracter 
    for (let i=0;i<n; i++){
        //un indice aleatoriu care sa mearga de la 0 la numarul de elemente - 1
        //nume aleatoriu inmultit cu (0,1] , floor taie zecimalele 
        //un indice aleator 
        token+=sirAlphaNum[Math.floor(Math.random()*sirAlphaNum.length)]
    }
    return token;
}

module.exports.genereazaToken=genereazaToken;