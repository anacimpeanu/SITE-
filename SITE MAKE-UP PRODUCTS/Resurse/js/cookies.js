//setCookie("a",10, 1000)
//local storage are doar chei si valori 
//vrem sa facem propiul cookie 
//valorile sunt vazute ca string-uri,deci trebuie sa le convertim 
//cookie raman stocate la client //sunt setate pe o anumita durata de timp, in local storage dam noi remove
//deci cookie are o data de expirare 
//nu am doua cookie uri cu acelasi nume pe pagina 



//creaaza un nou cookie
function setCookie(nume, val, timpExpirare){  //timpExpirare in milisecunde
    d=new Date();   //data de azi
    d.setTime(d.getTime()+timpExpirare) //deci returneaza in cat timp expira cookie-ul
    //il face in string
    document.cookie=`${nume}=${val} ; expires=${d.toUTCString()}`;
}

//primeste un cookie
function getCookie(nume){
    //doua cookie-rui sunt separate prin ;
    vectorParametri=document.cookie.split(";") // ["a=10","b=ceva"] //se obtine un vector de elemente 
    //dam split in situatia in care avem un cookie ,si vrem sa taiem = , trim sterge spatiile ca sa vedem daca incepe cu ce trebuie 
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            return param.split("=")[1]
    }
    return null;
}
//stergere cookie , stergem daca avem data de expirare de astazi ,adica curentDate
function deleteCookie(nume){
    console.log(`${nume}; expires=${(new Date()).toUTCString()}`) //ca sa le transformam in string
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}`;
}

//pentru delete all cookie luam pe rand fiecare cookie prin vector , cu split pt separare , si apelam pentru fiecare cookie delete cookie 
function deleteAllCookies() {
    let cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        let name=cookie.split("=")[0];
        deleteCookie(name)
    }
}

//efectul de click , inseamana ca accepta 

window.addEventListener("DOMContentLoaded", function(){

    //verificam daca exista cookie-ul acceptat_banner 
    if (getCookie("acceptat_banner")){
        //la refresh nu se mai afiseaza mesajul
        document.getElementById("ban").style.display="none";
    }

    //verificam daca exista cookie-ul accordion 
    if(getCookie("accordion")){
        //la refresh ramane pe valoarea apasata ( show) adica deschisa 
        document.getElementById("collapse").classList.add('show');
    }


    //ok_cookies e butonul din ejs , la click pe buton se seteaza un cookie care expira etc 
    this.document.getElementById("ok_cookies").onclick=function(){
        setCookie("acceptat_banner",true,10000);
        //se ascude paragraful cat avem cookie-ul setat 
        document.getElementById("ban").style.display="none"
    }
    //la apasarea lui 
    this.document.getElementById("accordionSection").onclick=function (){
        //daca exista il stergem deaorece il vrem inchis 
        if (getCookie("accordion")) {
            deleteCookie("accordion");
        }

        else{
            //cookie-ul ramane pe pagina pana va fi sters sau expirat 
            setCookie("accordion", true, 100000);
        }
    }
})