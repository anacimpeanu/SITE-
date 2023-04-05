const express = require("express");
const fs=require("fs");


app= express();

obGlobal={
    obErori:null,
    obImagini:null
}


console.log("Folder proiect", __dirname);
console.log("Nume fisier", __filename);
console.log("Director de lucru", process.cwd());


vectorFoldere=["temp","temp1"]
for(let folder of vectorFoldere){
    let caleFolder=__dirname+"/"+folder;
    if(!fs.existsSync(caleFolder))
        fs.mkdirSync(caleFolder);
}

app.set("view engine","ejs");

app.use("/resurse", express.static(__dirname+"/resurse"));

app.use(/^\/resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/,function(req,res){
        afiseazaEroare(res,403);
});

app.get("/favicon.ico",function(req,res){
    res.sendFile(__dirname+"/resurse/ico/favicon.ico");
});

app.get("/ceva", function(req, res){
    
    res.send("<h1>altceva</h1> ip:"+req.ip);
});



app.get(["/index","/","/home" ], function(req, res){
    res.render("pagini/index" , {ip: req.ip, a: 10, b:20});
});

app.get("/*",function(req,res){
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
        afisareEroare(res,404);
    }
  }
});


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
console.log("Serverul a pornit");