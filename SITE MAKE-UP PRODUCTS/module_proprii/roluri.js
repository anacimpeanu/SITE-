
const Drepturi=require('./drepturi.js');

//clasa rol este o clasa de baza => exista de alte clase derivate 
class Rol{
    //get returneaza valoare 
    static get tip() {return "generic"}
    static get drepturi() {return []}

    //tip-ul de rol
    constructor (){
        this.cod=this.constructor.tip;
    }
    //verifica daca exista dreptul respctiv 
    areDreptul(drept){ //drept trebuie sa fie tot Symbol
        console.log("in metoda rol!!!!") //fiecare cu drepturile sale
        return this.constructor.drepturi.includes(drept); //pentru ca e admin
    }
}


//adminul are toate drepturile 
class RolAdmin extends Rol{
    
    static get tip() {return "admin"}
    constructor (){
        super();
    }

    areDreptul(){
        return true; //pentru ca e admin
    }
}


//moderator ce drepturi are el 
class RolModerator extends Rol{
    
    static get tip() {return "moderator"}
    static get drepturi() { return [
        Drepturi.vizualizareUtilizatori,
        Drepturi.stergereUtilizatori
    ] }
    constructor (){
        super()
    }
}

//dreptul de cumparare produs 
class RolClient extends Rol{
    static get tip() {return "comun"}
    static get drepturi() { return [
        Drepturi.cumparareProduse
    ] }
    constructor (){
        super() //initializeaza instanta clasei parinte
    }
}

//creeaza o instanta care este o clasa derivata din clasa noastra 
//fabrica instante 
class RolFactory{
    static creeazaRol(tip) {
        //verific , daca da returnez un obiect de tip moderator /admin/client etc 
        switch(tip){
            case RolAdmin.tip : return new RolAdmin();
            case RolModerator.tip : return new RolModerator();
            case RolClient.tip : return new RolClient();
        }
    }
}


module.exports={
    RolFactory:RolFactory,
    RolAdmin:RolAdmin
}