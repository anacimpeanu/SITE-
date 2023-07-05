window.addEventListener("DOMContentLoaded", function () {

    function filterProducts() {
        let gramaj = document.getElementsByName("gr_rad");  //au atributul name=gr_rad

        let tipuri = document.getElementsByName("gr_chck"); //au atributul name=gr_chck

        let val_ingredient2 = document.getElementById("i_sel_multiplu"); //selectează elementul <select> din document folosind 
        //atributul id "i_sel_multiplu" și atribuie referința acestui element variabilei val_ingredient2.

        let produseAfisate = 0;

        let selectedIngrediente = [];
        for (let option of val_ingredient2.selectedOptions) {
            selectedIngrediente.push(option.value);
        }

        let val_gramaj;
        for (let r of gramaj) {
            if (r.checked) {
                val_gramaj = r.value;
            }
        }

        if (val_gramaj != "toate") {
            [gramaj_min, gramaj_max] = val_gramaj.split(":");
            var gramaj_min = parseInt(gramaj_min);
            var gramaj_max = parseInt(gramaj_max);
        }

        let val_tip = [];
        for (let t of tipuri) {
            if (t.checked) {
                val_tip.push(t.value);
            }
        }


        let val_nume = document.getElementById("inp-nume").value.toLowerCase();
        

        let val_ingredientInput = document.getElementById("i_datalist");

        let val_ingredient = document.getElementById("i_datalist").value;

        // verific daca exista 
        let datalistOptions = document.getElementById("id_lista").children;

        //o colectie de copii 

        let isValidIngredient = false;
        for (let i = 0; i < datalistOptions.length; i++) {
            if (datalistOptions[i].value === val_ingredient || val_ingredient=== "") {
                isValidIngredient = true;
                break;
            }
        }

        if (!isValidIngredient) {
            // atentionare ca nu exista 
            alert("Invalid ingredient!");
            val_ingredientInput.style.border = "3px solid red";
            return; // Stop further processing
        } else {
            // Reset the border to the default style
            val_ingredientInput.style.border = "";
        }

        let val_pret = document.getElementById("inp-pret").value;

        let val_categorie = document.getElementById("inp-categorie").value;

        var produse = document.getElementsByClassName("produs");

        let val_descriere = document.getElementById("i_textarea").value.toLowerCase();
        
        // Verifica daca val_nume contine "*"



        for (let prod of produse) {
            prod.style.display = "none";

            // valori din produs
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            let cond1 = (nume.startsWith(val_nume));

            let prod_gramaj = parseInt(prod.getElementsByClassName("val-gramaj")[0].innerHTML);
            let cond2 = (val_gramaj == "toate" || gramaj_min <= prod_gramaj && prod_gramaj < gramaj_max);

            let prod_pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
            let cond3 = (val_pret <= prod_pret);

            let prod_categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;
            let cond4 = (val_categorie == "toate" || val_categorie == prod_categorie);

            let prod_tip = prod.getElementsByClassName("val-tip")[0].innerHTML;
            let cond5 = (val_tip.includes(prod_tip));

            let prod_ingredient = prod.getElementsByClassName("val-ingredient")[0].innerHTML;
            let cond6 = (val_ingredient === "" || prod_ingredient.includes(val_ingredient));

            let prod_descriere = prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();
            let cond7 = (val_descriere === "" || prod_descriere.includes(val_descriere));

            let cond8 = selectedIngrediente.length === 0 || !selectedIngrediente.some(ingredient => prod_ingredient.includes(ingredient));
            //se cauta sa nu existe in array valoarea ingredientului //some testeaza conditiile 
            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8)
                prod.style.display = "block";

        }

        if (getCookie("acceptat_banner"))
            setLastFiltersCookie(filters);
    };



    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
        filterProducts();
    }

    document.getElementById("inp-nume").onchange = function () {
        filterProducts();
    };

    document.getElementById("inp-categorie").onchange = function () {
        filterProducts();
    };

    document.getElementsByName("gr_rad").forEach(function (radio) {
        radio.onchange = function () {
            filterProducts();
        }
    }); //forEach pentru a itera prin fiecare element radio selectat.

    document.getElementsByName("gr_chck").forEach(function (select) {
        select.onchange = function () {
            filterProducts();
        }
    });

    document.getElementById("i_datalist").onchange = function () {
        filterProducts();
    }

    document.getElementById("i_textarea").onchange = function () {
        filterProducts();
    }

    document.getElementById("i_sel_multiplu").onchange = function () {
        filterProducts();
    }


    document.getElementById("filtrare").onclick = function () {
        // inputuri
        filterProducts();
    }

    document.getElementById("resetare").onclick = function () {
        if (confirm("Are you sure you want to reset the filters?")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("i_rad4").checked = true;
            document.getElementById("i_datalist").value = "";
            document.getElementById("i_textarea").value = "";
            document.getElementById("i_sel_multiplu").value = "";
            var produse = document.getElementsByClassName("produs");

            resetLastFiltersCookie();

            for (let prod of produse) {
                prod.style.display = "block";
            }
        }
    };
    window.onchange = function (){
        let count=0;
        var produse = document.getElementsByClassName("produs");
        for (let  prod of produse){
            if (prod.style.display!=="none")
                count++;
        }
        console.log(count)
        if(count===0)
            alert("Nu exista produse conform filtrării curente!")
    }

    function sortare(semn) {
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse); //array

        v_produse.sort(function (a, b) {
            var pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            var pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a == pret_b) {
                var nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
                var nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn * nume_a.localeCompare(nume_b);
            }
            return semn * (pret_a - pret_b);
        })

        for (let prod of v_produse) {
            prod.parentElement.appendChild(prod);
        }

    }

    document.getElementById("sortCrescNume").onclick = function () {
        sortare(1)
    }
    document.getElementById("sortDescrescNume").onclick = function () {
        sortare(-1)
    }

    window.onkeydown = function (e) {
        if (e.key == "c" && e.altKey) {
            if (document.getElementById("info-suma"))
                return;
            var produse = document.getElementsByClassName("produs");
            let suma = 0;
            for (let prod of produse) {
                if (prod.style.display != "none") {
                    let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                    suma += pret;
                }
            }
            let p = document.createElement("p");
            p.innerHTML = suma;
            p.id = "info-suma";
            ps = document.getElementById("p-suma");
            container = ps.parentNode;
            frate = ps.nextElementSibling;
            container.insertBefore(p, frate); // ca sa punem dupa container 
            setTimeout(function () {
                let info = document.getElementById("info-suma");
                if (info)
                    info.remove();
            }, 1000)
        }
    }

    // Add event listener to the filter button
    // document.getElementById("filter-button").addEventListener("click", filterProducts);
    const textarea = document.getElementById("i_textarea");

    function validare(textarea) {
        let val_descriere = textarea.value.toLowerCase();
        var produse = document.getElementsByClassName("produs");
        let isInvalid = true; // Flag to track validation result

        for (let prod of produse) {
            let prod_descriere = prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();
            if (prod_descriere.includes(val_descriere)) {
                isInvalid = false;
                break; // Exit the loop if a match is found
            }
        }

        if (isInvalid) {
            textarea.classList.add("is-invalid"); // Add the is-invalid class
        } else {
            textarea.classList.remove("is-invalid"); // Remove the is-invalid class
        }
    }

    // Event listener to trigger validation on textarea input
    textarea.addEventListener("input", function () {
        validare(textarea);
    });


});
