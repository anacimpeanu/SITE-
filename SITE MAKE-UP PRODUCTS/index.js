const express = require("express");
const fs=require("fs");
const path=require('path');
const sharp=require('sharp');
const sass=require('sass');
const ejs=require('ejs');
const{Client}=require('pg');

const AccesBD=require("./module_proprii/accesbd.js"); //unde este el fata de index.js

const formidable=require("formidable");
const {Utilizator}=require("./module_proprii/utilizator.js")
const session=require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");

const QRCode = require('qrcode');


AccesBD.getInstanta().select({
    tabel:"makeup",
    campuri:["nume","pret","ingredient"],
    conditiiAnd:["pret>7"]

}, function(err,rez){   //  functia callback
    console.log(err);
    console.log(rez);
}
);

var client=new Client({
    database:"kyracosmetics",
    user:"ana",
    password:"1234",
    host:"localhost",
    port:5432 });

client.connect();


obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname, "Resurse/scss"),
    folderCss: path.join(__dirname, "Resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu: [],
    protocol: "http://",
    numeDomeniu: "localhost:8080"

}

client.query("select * from unnest(enum_range(null::categ_makeup))", function(err, rezCategorie){
    if (err){
        console.log(err);
    }
    else{
        obGlobal.optiuniMeniu=rezCategorie.rows;
    }
});


app= express();
console.log("Folder proiect", __dirname);
console.log("Nume fisier", __filename);
console.log("Director de lucru", process.cwd());

//un obiect special ca sa memorez datele utilizatorului in sesiune =>session
app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));

  vectorFoldere=["temp","temp1", "backup","poze_uploadate"]
  for(let folder of vectorFoldere){
      let caleFolder=__dirname+"/"+folder;
      if(!fs.existsSync(caleFolder))
          fs.mkdirSync(caleFolder);
  }

  function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){
        let vectorCale=caleScss.split("\\")
        let numeFisExt=path.basename(caleScss);

        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    
    // la acest punct avem cai absolute in caleScss si  caleCss
    let vectorCale=caleCss.split("\\");
    let caleResBackup=path.join(obGlobal.folderBackup,"resurse/css");
    if(!fs.existsSync(caleResBackup))
        fs.mkdirSync(caleResBackup,{recursive:true});

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup,numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    console.log("Compilare SCSS",rez);
}

//compileazaScss("a.scss");
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}
fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

  
app.set("view engine","ejs");


app.use("/Resurse", express.static(__dirname+"/Resurse"));
app.use("/poze_uploadate", express.static(__dirname + "/poze_uploadate"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));


app.use("/*",function(req, res, next){
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu;
    //vreau sa trimit drepturile catre pagina
    res.locals.Drepturi=Drepturi;
    //utilizator logat 
    if (req.session.utilizator){
        //locals il folosesc in ejs 
        //toate paginile au utilizatorul logat 
        req.utilizator=res.locals.utilizator=new Utilizator(req.session.utilizator);
    }    
    next();
});

app.use(/^\/Resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/,function(req,res){
    afiseazaEroare(res,403);
}); 


app.get("/favicon.ico",function(req,res){
    res.sendFile(__dirname+"/Resurse/ico/favicon.ico");
});

app.get("/ceva", function(req, res){
    
    res.send("<h1>altceva</h1> ip:"+req.ip);
});


app.get(["/index","/","/home","login"], function(req, res){
    res.render("pagini/index" , {ip: req.ip, a: 10, b:20 ,imagini: obGlobal.obImagini.imagini,mesajLogin:""});
});




//-------------------------------------------------------------------------------------------------------------------------------------------------

app.get("/produse",function(req, res){
   
    client.query("select * from unnest(enum_range(null::categ_makeup))", 
    function(err, rezCategorie){
        if (err){
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else{

            let conditieWhere="";
            if(req.query.categorie){
                conditieWhere=` where categorie='${req.query.categorie}'`;
             } //"where tip='"+req.query.tip+"'"

                client.query("select * from makeup"+conditieWhere , function( err, rez){
                console.log(300)
                if(err){
                    console.log(err);
                    afiseazaEroare(res, 2);
                }
                else{
                    client.query(
                        "SELECT MIN(pret) AS min_price, MAX(pret) AS max_price FROM makeup",
                        function (err, rezPret) {
                            if (err) {
                                console.log(err);
                                afiseazaEroare(res, 2);
                            } else {
                                client.query(
                                    "SELECT distinct(unnest(ingredient)) FROM makeup",
                                    function (err, rezIngredient) {
                                        if (err) {
                                            console.log(err);
                                            afiseazaEroare(res, 2);
                                        } else {
                                            client.query(
                                                "SELECT * FROM unnest(enum_range(null::tipuri_makeup))",
                                                function (err, rezTip) {
                                                    if (err) {
                                                        console.log(err);
                                                        afiseazaEroare(res, 2);
                                                    } else { 
                                                        res.render("pagini/produse", {
                                                        
                                                        produse: rez.rows,
                                                        optiuni: rezCategorie.rows,
                                                        minPrice: rezPret.rows[0].min_price,
                                                        maxPrice: rezPret.rows[0].max_price,
                                                        ingredient: rezIngredient.rows.map((row) => row.unnest),
                                                        tipuri: rezTip.rows,
                                                    });
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                );
            }
        }
    );
}
}
);
});

app.get("/produs/:id",function(req, res){
    console.log(req.params);
    
    client.query(`select * from makeup where id=${req.params.id}`, function( err, rezultat){
        if(err){
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else
            res.render("pagini/produs", {prod:rezultat.rows[0]});
    });
});

///////////////////////////Utilizatori/////////////////////


app.post("/inregistrare",function(req, res){
    // sa le pot vedea in toate functiile definite 
    //variabile globale din interiorul ei 

    var username;
    var poza;
    //datele primite din browser 
    var formular= new formidable.IncomingForm()
    //un obiect care asteapta de la utilizator datele 
    formular.parse(req, function(err, campuriText, campuriFisier ){//4
        console.log("Inregistrare:",campuriText);

        console.log(campuriFisier);
        console.log(poza,username );
        var eroare="";

        var utilizNou=new Utilizator();
        //apeleaza metoda setter
        //o metoda setter care afiseaza prenumle 
        if (campuriText.parola.length < 6) {
            eroare += "Parola trebuie sa contina cel putin 6 caractere. ";
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
          }
          if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d.*\d)(?=.*[.!@#$%^&*()])/g.test(campuriText.parola)) {
            eroare += "Parola trebuie să conțină minim o literă mare, o literă mică, 2 cifre și un caracter punct. ";
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
          }
          if (campuriText.username.length < 6) {
            eroare += "Username trebuie sa contina cel putin 6 caractere. ";
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
          }
        try{
            utilizNou.setareNume=campuriText.nume;
            utilizNou.setareUsername=campuriText.username;
            utilizNou.email=campuriText.email;
            utilizNou.prenume=campuriText.prenume;
            utilizNou.parola=campuriText.parola;
            utilizNou.culoare_chat=campuriText.culoare_chat;
            utilizNou.poza= poza;
            //verificam daca exista in baza de date 
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(u, parametru ,eroareUser ){
                if (eroareUser==-1){//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else{
                    eroare+="Mai exista username-ul";
                }
                //din formular locals cu raspunsul 
                if(!eroare){
                    res.render("pagini/inregistrare", {raspuns:"Inregistrare cu succes!"})
                    
                }
                else
                    res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
            })
            

        }
        catch(e){ 
            console.log(e);
            eroare+= "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare})
        }
    



    });
    //declansare la fiecare input 
    //pentru fiecare nume ,prenume etc 
    //valorile de dupa = vin de la username 
    //din formular apar de la name 
    //name valoarea lui nume 
    formular.on("field", function(nume,val){  // 1 
	
        console.log(`--- ${nume}=${val}`);
		
        if(nume=="username")
            username=val;
    }) 
    //de tip fisier 
    formular.on("fileBegin", function(nume,fisier){ //2
        console.log("fileBegin");
		
        console.log(nume,fisier);
        //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        //dirname a lui index.js
        let folderUser=path.join(__dirname, "poze_uploadate",username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);

        //concatenez acelasi nume cu ce a incarcat 
        fisier.filepath=path.join(folderUser, fisier.originalFilename)
        poza=fisier.originalFilename
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

        console.log("fileBegin:",poza);
        console.log("fileBegin,fisier : ",fisier);

    })   
    //de abia aici vedem file  
    //putem rezova dimensiunea 
    formular.on("file", function(nume,fisier){//3
        console.log("file");
        console.log(nume,fisier);
    }); 
});


app.post("/login",function(req, res){
    var username;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){
        Utilizator.getUtilizDupaUsername (campuriText.username,{
            req:req,
            res:res,
            parola:campuriText.parola
        }, function(u, obparam ){
            let parolaCriptata=Utilizator.criptareParola(obparam.parola);
            if(u.parola==parolaCriptata && u.confirmat_mail ){
                u.poza=u.poza?path.join("poze_uploadate",u.username, u.poza):"";
                obparam.req.session.utilizator=u;
                
                obparam.req.session.mesajLogin="Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                //obparam.res.render("/login");
            }
            else{
                console.log("Eroare logare")
                obparam.req.session.mesajLogin="Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});


app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        afiseazaEroare(res,403,)
        res.render("pagini/eroare_generala",{text:"Nu sunteti logat."});
        return;
    }
    //campurile bagate de utilizator 
    var formular= new formidable.IncomingForm();
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },  
        AccesBD.getInstanta().updateParametrizat(

            {tabel:"utilizatori",
            //campuri de update 
            campuri:["nume","prenume","email","culoare_chat"],
            valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
            //condtie daca si numai daca parola e aceeasi 
            //to do pt username 
            conditiiAnd:[`parola='${parolaCriptata}'`, `username='${campuriText.username}'`] 
        },          
        function(err, rez){ if(err){
            console.log(err);
            afiseazaEroare(res,2);
            return;
        }
        console.log(rez.rowCount);
        if (rez.rowCount==0){
            res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
            return;
        }
        else{            
            //actualizare sesiune
            console.log("ceva");
            req.session.utilizator.nume= campuriText.nume;
            req.session.utilizator.prenume= campuriText.prenume;
            req.session.utilizator.email= campuriText.email;
            req.session.utilizator.culoare_chat= campuriText.culoare_chat;
            res.locals.utilizator=req.session.utilizator;
        }


        res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});
    });
       
 
});
});

///////////////////////////////////////Admistrare utiliatori/////////////////////////////////////////
app.get("/useri", function(req, res){
    //verific daca are dreptul de a vizualiza utilizatorii 
    if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
        //selectam toate informatiile 
        //le afisam 
        AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){
            console.log(err);
            res.render("pagini/useri", {useri: rezQuery.rows});
        });
    }
    else{
        renderError(res, 403);
    }
});

app.post("/sterge_utiliz", function(req, res){
    if(req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)){
        var formular= new formidable.IncomingForm();
 
        formular.parse(req,function(err, campuriText, campuriFile){
           
                AccesBD.getInstanta().delete({tabel:"utilizatori", conditiiAnd:[`id=${campuriText.id_utiliz}`]}, function(err, rezQuery){
                console.log(err);
                res.redirect("/useri");
            });
        });
    }else{
        renderError(res,403);
    }
})

app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pagini/logout");
});

//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
//pentru link

app.get("/cod/:username/:token",function(req,res){
    console.log(req.params);
    try {
        //primeste username-ul , o functie callback ,un obiect
        //vrem sa actualizam acest utilizator 
        Utilizator.getUtilizDupaUsername(req.params.username,{res:res,token:req.params.token} ,function(u,obparam){
            AccesBD.getInstanta().update(
                {tabel:"utilizatori",
                campuri:{confirmat_mail:'true'}, 
                conditiiAnd:[`cod='${obparam.token}'`]}, 
                //cod-ul egal cu cel din token 
                //daca s-a update cu succes , intra in confirmare ejs 
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        afisareEroare(res,3);
                    }
                    else{
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        renderError(res,2);
    }
})
/////////////////examen
const nodemailer=require("nodemailer");

app.get(["/animalute","/jucarii_5"],function(req, res){
    client.query("select * from unnest(enum_range(null::specii_animalute))", 
    function(err, rezCategorie){
        if (err){
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else{

            let conditieWhere="";
            if(req.query.specie){
                conditieWhere=` where specie='${req.query.specie}'`;
             } //"where tip='"+req.query.tip+"'"

   
        client.query("select * from animalute" , function( err, rez){
        if(err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else{
            //console.log(rez);
            for(let animal of rez.rows){
                console.log(animal["data_adaugare"].toString());
            }
            res.render("pagini/animalute", {produse:rez.rows});
        }
    });
}   
    });        

});

async function trimiteMail(email,subiect, mesajText, mesajHtml, atasamente=[]){
    let emailServer="test.tweb.node@gmail.com";
    var transp= nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth:{//date login 
            user:emailServer,
            pass:"rwgmgkldxnarxrgu"
        },
        tls:{
            rejectUnauthorized:false
        }
    });
    //genereaza html
    await transp.sendMail({
        from:emailServer,
        to:email, //TO DO
        subject:subiect,//"Te-ai inregistrat cu succes",
        text:mesajText, //"Username-ul tau este "+username
        html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
        attachments: atasamente
    })
    console.log("trimis mail");
}


app.post("/jucarii_5", function(req, res){
  
        var formular= new formidable.IncomingForm();
 
        formular.parse(req,function(err, campuriText, campuriFile){
            console.log(123);
            console.log(campuriText);
            mesaj=(new Date())+" "+campuriText.ascuns;
            for (let email of campuriText.email){
                trimiteMail(email,"examen", mesaj, mesaj)
            }
            res.redirect("/jucarii");
        });

})







// ^\w+\.ejs$

app.get("/*.ejs",function(req,res){
    afiseazaEroare(res,400);
});

app.get("/*",function(req, res){
    try{
    console.log("cale:",req.url);
    res.render("pagini"+ req.url, function(err, rezRandare){
        console.log("Eroare:", err);
        console.log("Rezultat randare:", rezRandare);
        if (err){
            console.log(err);
            if(err.message.startsWith("Failed to lookup view "))
                afiseazaEroare(res,404,"titlu custom");
            else
                afiseazaEroare(res);
        }
        else{
            res.send(rezRandare);
        }
    });
  }catch(err){
    if(err.message.startsWith("Cannot find module")){
        afiseazaEroare(res,404);
    }
  }
});

/////////////////////////Erori//////////////////////////////////////////

function initializeazaErori(){
    var continut= fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    console.log(continut);
    var obErori=JSON.parse(continut)
    // for (let i=0; i< obErori.info_erori.length;i++ ){
    //     console.log(obErori.info_erori[i].imagine)
    // }
    for (let eroare of obErori.info_erori){
        eroare.imagine="/"+obErori.cale_baza+"/"+eroare.imagine;
    }
    obGlobal.obErori=obErori;
}

initializeazaErori();
//////////////////////////////////////////////////////
function initializeazaImagini(){
    var continut= fs.readFileSync(path.join(__dirname+"/resurse/json/galerie.json")).toString("utf-8");
    
    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(caleAbs,"mediu");
    if(!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    // for (let i=0; i< obErori.info_erori.length;i++ ){
    //     console.log(obErori.info_erori[i].imagine)
    // }
    for (let imag of vImagini){
        [nume_fisier,extensie]=imag.fisier.split(".");
        imag.fisier_mediu="/" + path.join(obGlobal.obImagini.cale_galerie, "mediu", nume_fisier + ".webp");
        let caleAbsFismediu=path.join(__dirname,imag.fisier_mediu)
        sharp(path.join(caleAbs,imag.fisier)).resize(400).toFile(caleAbsFismediu);
        imag.fisier="/"+path.join(obGlobal.obImagini.cale_galerie,imag.fisier);
        //eroare.imagine="/"+obErori.cale_baza+"/"+eroare.imagine;
    }
   
}

initializeazaImagini();
// TO DO named parameters
function afiseazaEroare(res, identificator, titlu="titlu default", text, imagine){
    let eroare = obGlobal.obErori.info_erori.find(function(elemErr){return elemErr.identificator==identificator});
    if(eroare){
        let titlu1= titlu=="titlu default" ?(eroare.titlu || titlu) : titlu ;
        let text1= text || eroare.text;
        let imagine1= imagine || eroare.imagine;
        if (eroare.status)
            res.status(eroare.identificator).render("pagini/eroare", {titlu: titlu1, text:text1, imagine: imagine1});
        else
            res.render("pagini/eroare", {titlu: titlu1, text:text1, imagine: imagine1});
    }
    else{
        res.render("pagini/eroare", {
            titlu: obGlobal.obErori.eroare_default.titlu, 
            text:obGlobal.obErori.eroare_default.text, 
            imagine: obGlobal.obErori.eroare_default.imagine
        });
    }
}


app.listen(8080);
console.log("Serverul a pornit");
