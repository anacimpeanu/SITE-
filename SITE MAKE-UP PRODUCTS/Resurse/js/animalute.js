window.onload = function() {
    document.getElementById("jucarii_sterse").innerHTML = localStorage.getItem("nume_jucarii");
    document.getElementById("ascuns").value = localStorage.getItem("nume_jucarii");

    function sorteaza() {
        const ordine = document.getElementById("ordine_sortare").value.toLowerCase();
        console.log(ordine);
        let animale = Array.from(document.getElementsByClassName("anm"));
        animale.sort(function(a, b) {
            const valoareA = parseInt(a.getElementsByClassName("val-varsta")[0].innerHTML);
            const valoareB = parseInt(b.getElementsByClassName("val-varsta")[0].innerHTML);

            if (ordine === "1") {
                return valoareA - valoareB;
            } else if (ordine === "-1") {
                return valoareB - valoareA;
            } else {
                return 0;
            }
        
        });
        const produseContainer = document.getElementById("produse");
        animale.forEach(function(anm) {
            produseContainer.appendChild(anm);
        });
    }

    document.getElementById("sorteaza").onclick = sorteaza;



    function filtrare(){
        
        let animale= document.getElementsByClassName("anm");
        console.log(122)
        for (let anm of animale){
            jucarie.style.display="none";
            if (anm.getElementName("")[0].checked){
                jucarie.style.display="block";
            }
        }
    }

    document.getElementById("filtrare").onclick=filtrare;

    butoane_sterge=document.getElementsByClassName("sterge");
    for(let bt of butoane_sterge){
        bt.onclick=function(){
            this.parentElement.style.display="none";
            let id_jucarie=this.id.substr(1);
            let nume_jucarie=this.name;
            //"jucarii"   "3,10,5"
            let v_iduri= localStorage.getItem("jucarii");
            let v_nume= localStorage.getItem("nume_jucarii");
            if (!v_iduri) 
                {
                    v_iduri=id_jucarie;
                    v_nume=nume_jucarie;
                }
            else{
                v_iduri+=","+id_jucarie
                v_nume+=","+nume_jucarie;
            }
            localStorage.setItem("jucarii",v_iduri);
            localStorage.setItem("nume_jucarii",v_nume);
            document.getElementById("ascuns").value=v_nume;
        }
    }

    document.getElementById("reseteaza_ls").onclick=function(){
        localStorage.clear();
        document.getElementById("jucarii_sterse").innerHTML="";
        filtrare();
        sorteaza();
    }

}