DROP TYPE IF EXISTS categ_makeup;
DROP TYPE IF EXISTS tipuri_makeup;
DROP TYPE IF EXISTS categ_necesar;

CREATE TYPE categ_makeup AS ENUM('ten','ochi','buze','accesorii','skincare');
CREATE TYPE tipuri_makeup AS ENUM( 'eyeliner', 'ruj', 'fond de ten', 'beauty blender', 'pensula', 'creion', 'fard', 'pudra', 'bronzer', 'corector', 'primer', 'crema', 'gloss', 'blush','iluminator' , 'glitter' , 'paleta' , 'portfard' ,'serum' ,'demachiant', 'rimel' , 'spray fixare' , 'stick cremos', 'creion sprancene');
CREATE TYPE categ_necesar AS ENUM('vegan','protectie solara','hidratare','bestsellers' ,'promotii');
CREATE TYPE categ_finish AS ENUM('mat','lucios','natural');

CREATE TABLE IF NOT EXISTS makeup (
	id serial PRIMARY KEY,
	nume varchar(50) UNIQUE NOT NULL,
	descriere TEXT,
	imagine VARCHAR(300),
	tip_makeup tipuri_makeup,
	categorie categ_makeup,
	finish categ_finish,
	pret NUMERIC(8,2) NOT NULL,
	gramaj INT NOT NULL CHECK (gramaj>=0),
	data_adaugare TIMESTAMP DEFAULT current_timestamp,
	necesar categ_necesar,
	ingredient VARCHAR[],
	admite_voucher BOOLEAN
);

INSERT into makeup (nume, descriere, imagine, categorie, tip_makeup, finish, pret, gramaj, necesar, ingredient, admite_voucher) VALUES
('Rimel volumizator', 'Rimelul volumizator conferă genelor tale un aspect amplificat și voluminos. Cu o perie specială, acest rimel separă și alungește genele, oferindu-ți un efect dramatic și seducător.', 'rimel-volumizator.jpg', 'ochi','rimel', 'mat',  44.99, 30, 'bestsellers', '{"apa", "carnauba", "pigmenti"}', true),

('Spray de fixare', 'Spray-ul de fixare ajută la păstrarea machiajului impecabil pe durata întregii zile. Formula sa specială asigură o fixare puternică, rezistență la transfer și un aspect proaspăt pe tot parcursul zilei.', 'spray-fixare.jpg', 'skincare','spray fixare', 'natural',  39.99, 150, 'hidratare', '{"apa", "alcool", "glicerina"}', true),

('Paletă de farduri', 'Paleta de farduri este un must-have pentru orice pasionată de machiaj. Cu o varietate de culori și finisaje, această paletă îți oferă posibilitatea de a crea o multitudine de machiaje, de la cele naturale până la cele dramatice.', 'paleta-farduri.jpg', 'ochi','paleta','mat',   79.99, 80, 'promotii', '{"pigmenti", "mica", "talc"}', true),

('Portfard', 'Portfardul este perfect pentru a-ți păstra toate produsele de machiaj organizate și la îndemână. Cu multiple compartimente și un design practic, acest portfard este ideal pentru călătorii sau pentru a avea totul la îndemână acasă.', 'portfard.jpg', 'accesorii','portfard', 'mat',  49.99, 20, 'promotii', '{"poliester", "fermoar", "plastic"}', false),


('Crema hidratantă', 'Crema hidratantă este esențială pentru menținerea unei pielii sănătoase și hidratate. Formula sa bogată în ingrediente hidratante și hrănitoare pătrunde adânc în piele, asigurându-i hidratarea necesară pe tot parcursul zilei.', 'crema-hidratanta.jpg', 'skincare','crema', 'natural',  39.99, 50, 'hidratare', '{"acid hialuronic", "ulei de argan", "vitamina E"}', true),

('Gloss de buze', 'Glossul de buze oferă buzelor tale o strălucire subtilă și un aspect voluminos. Cu o textură ușoară și nelipicioasă, acest gloss este confortabil de purtat și adaugă un plus de hidratare și strălucire buzelor tale.', 'gloss-buze.jpg', 'buze','gloss', 'lucios',  24.99, 6, 'vegan', '{"ulei de jojoba", "pigmenti", "arome naturale"}', true),

('Blush', 'Blush-ul adaugă un aspect proaspăt și sănătos obrajilor tăi. Cu o textură fină și pigmentată, acest blush se aplică ușor și se estompează frumos pe piele, oferindu-ți un aspect natural și radiant.', 'blush.jpg', 'ten','blush', 'mat',  29.99, 20, 'bestsellers','{"pigmenti", "talc", "stearat de magneziu"}', true),

('Iluminator', 'Iluminatorul conferă tenului tău un aspect luminos și strălucitor. Cu o textură fină și o formulă intens pigmentată, acest iluminator adaugă puncte de lumină pe zonele cheie ale feței, creând un aspect radiant și definitoriu.', 'iluminator.jpg', 'ten','iluminator', 'lucios',  34.99, 20, 'promotii', '{"mica", "pigmenti", "stearat de magneziu"}', true),

('Creion glitter', 'Creionul glitter adaugă un plus de strălucire și sclipire machiajului tău. Cu o textură cremoasă și particule de sclipici, acest creion se aplică ușor și adaugă un efect spectaculos și glamoros machiajului tău.', 'creion-glitter.jpg', 'ochi','glitter', 'lucios',  19.99, 10, 'promotii', '{"apa", "pigmenti", "sclipici"}', true),

('Primer pentru ten', 'Primerul pentru ten pregătește și uniformizează pielea înainte de aplicarea fondului de ten. Cu o formulă ușoară și matifiantă, acest primer reduce porii și prelungește durata machiajului, asigurând un aspect impecabil pe parcursul întregii zile.', 'primer-ten.jpg', 'mat', 'ten','primer',  39.99, 30, 'vegan', '{"silicon", "glicerina", "vitamina E"}', true),

('Creion de ochi', 'Creionul de ochi este perfect pentru a crea linii precise și expresive. Cu o textură moale și cremoasă, acest creion se aplică ușor și oferă o rezistență ridicată, pentru un machiaj de lungă durată.', 'creion-ochi.jpg', 'ochi','creion','mat',   19.99, 10, 'promotii', '{"carnauba", "ceruri sintetice", "pigmenti"}', true),

('Pudră matifiantă', 'Pudra matifiantă ajută la controlul excesului de sebum și la fixarea machiajului pentru o mai lungă durată. Cu o textură fină și matifiantă, această pudră lasă tenul mat și fără strălucire nedorită.', 'pudra-matifianta.jpg', 'ten','pudra', 'mat',  34.99, 80, 'vegan', '{"talc", "stearat de magneziu", "pigmenti"}', true),

('Corector', 'Corectorul este perfect pentru a acoperi imperfecțiunile și cearcănele. Cu o textură cremoasă și o acoperire ridicată, acest corector uniformizează tenul și oferă un aspect impecabil.', 'corector.jpg', 'ten','corector', 'mat',  19.99, 50, 'hidratare', '{"pigmenti", "ulei de jojoba", "vitamina E"}', true),


('Stick cremos pentru contur', 'Stickul cremos pentru contur este perfect pentru a defini și contura trăsăturile feței. Cu o textură moale și cremoasă, acest stick se aplică ușor și oferă un contur precis și natural.', 'stick-cremos-contur.jpg', 'ten','stick cremos', 'lucios',  19.99, 65, 'promotii', '{"pigmenti", "ceruri sintetice", "ulei de cocos"}', true),

('Stick cremos pentru obraji', 'Stickul cremos pentru obraji oferă un aspect proaspăt și sănătos pomeților tăi. Cu o textură ușoară și o nuanță vibrantă, acest stick se aplică cu ușurință și conferă un efect de rubor natural.', 'stick-cremos-obraji.jpg', 'ten','stick cremos','natural',   21.99, 65, 'hidratare', '{"ceruri sintetice", "pigmenti", "vitamina E"}', true);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ana;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ana;