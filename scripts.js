//Tomar y configurar el canvas
var canvas = document.getElementById("canvas");
var video = document.getElementById("video");
var ctx = canvas.getContext("2d");
var modelo = null;
var size = 400;
var camaras = [];

var currentStream = null;
var facingMode = "user"; //Para que funcione con el celular (user/environment)

(async () => {
    console.log("Cargando modelo...");
    modelo = await tf.loadLayersModel("model02/model.json");
    console.log("Modelo cargado...");
})();

window.onload = function() {
    mostrarCamara();
}

function mostrarCamara() {

    var opciones = {
        audio: false,
        video: {
            facingMode: "user", width: size, height: size
        }
    };

    if(navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(opciones)
            .then(function(stream) {
                currentStream = stream;
                video.srcObject = currentStream;
                procesarCamara();
                predecir();
            })
            .catch(function(err) {
                alert("No se pudo utilizar la camara :(");
                console.log("No se pudo utilizar la camara :(", err);
                alert(err);
            })
    } else {
        alert("No existe la funcion getUserMedia... oops :( no se puede usar la camara");
    }
}

function cambiarCamara() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => {
            track.stop();
        });
    }

    facingMode = facingMode == "user" ? "environment" : "user";

    var opciones = {
        audio: false,
        video: {
            facingMode: facingMode, width: size, height: size
        }
    };


    navigator.mediaDevices.getUserMedia(opciones)
        .then(function(stream) {
            currentStream = stream;
            video.srcObject = currentStream;
        })
        .catch(function(err) {
            console.log("Oops, hubo un error", err);
        })
}

function predecir() {
    if (modelo != null) {
        //Pasar canvas a version 150x150
        resample_single(canvas, 224, 224, othercanvas);

        var ctx2 = othercanvas.getContext("2d");

        var imgData = ctx2.getImageData(0,0,224,224);
        var arr = []; //El arreglo completo
        var arr150 = []; //Al llegar a arr150 posiciones se pone en 'arr' como un nuevo indice
        for (var p=0, i=0; p < imgData.data.length; p+=4) {
            var red = imgData.data[p];
            var green = imgData.data[p+1];
            var blue = imgData.data[p+2];
            arr150.push([red, green, blue]); //Agregar al arr150 y normalizar a 0-1. Aparte queda dentro de un arreglo en el indice 0... again
            if (arr150.length == 224) {
                arr.push(arr150);
                arr150 = [];
            }
        }

        arr = [arr]; //Meter el arreglo en otro arreglo...
        //Debe estar en un arreglo nuevo en el indice 0, por ser un tensor4d en forma 1, 150, 150, 1
        var tensor4 = tf.tensor4d(arr);
        var resultados = modelo.predict(tensor4).dataSync();
        var mayorIndice = resultados.indexOf(Math.max.apply(null, resultados));
        var prob = resultados[mayorIndice];
        var probabilidadFormateada = (prob * 100).toFixed(3) + "%";

        var clases = ['ABBOTTS BABBLER',
        'ABBOTTS BOOBY',
        'ABYSSINIAN GROUND HORNBILL',
        'AFRICAN CROWNED CRANE',
        'AFRICAN EMERALD CUCKOO',
        'AFRICAN FIREFINCH',
        'AFRICAN OYSTER CATCHER',
        'AFRICAN PIED HORNBILL',
        'AFRICAN PYGMY GOOSE',
        'ALBATROSS',
        'ALBERTS TOWHEE',
        'ALEXANDRINE PARAKEET',
        'ALPINE CHOUGH',
        'ALTAMIRA YELLOWTHROAT',
        'AMERICAN AVOCET',
        'AMERICAN BITTERN',
        'AMERICAN COOT',
        'AMERICAN DIPPER',
        'AMERICAN FLAMINGO',
        'AMERICAN GOLDFINCH',
        'AMERICAN KESTREL',
        'AMERICAN PIPIT',
        'AMERICAN REDSTART',
        'AMERICAN ROBIN',
        'AMERICAN WIGEON',
        'AMETHYST WOODSTAR',
        'ANDEAN GOOSE',
        'ANDEAN LAPWING',
        'ANDEAN SISKIN',
        'ANHINGA',
        'ANIANIAU',
        'ANNAS HUMMINGBIRD',
        'ANTBIRD',
        'ANTILLEAN EUPHONIA',
        'APAPANE',
        'APOSTLEBIRD',
        'ARARIPE MANAKIN',
        'ASHY STORM PETREL',
        'ASHY THRUSHBIRD',
        'ASIAN CRESTED IBIS',
        'ASIAN DOLLARD BIRD',
        'ASIAN GREEN BEE EATER',
        'ASIAN OPENBILL STORK',
        'AUCKLAND SHAQ',
        'AUSTRAL CANASTERO',
        'AUSTRALASIAN FIGBIRD',
        'AVADAVAT',
        'AZARAS SPINETAIL',
        'AZURE BREASTED PITTA',
        'AZURE JAY',
        'AZURE TANAGER',
        'AZURE TIT',
        'BAIKAL TEAL',
        'BALD EAGLE',
        'BALD IBIS',
        'BALI STARLING',
        'BALTIMORE ORIOLE',
        'BANANAQUIT',
        'BAND TAILED GUAN',
        'BANDED BROADBILL',
        'BANDED PITA',
        'BANDED STILT',
        'BAR-TAILED GODWIT',
        'BARN OWL',
        'BARN SWALLOW',
        'BARRED PUFFBIRD',
        'BARROWS GOLDENEYE',
        'BAY-BREASTED WARBLER',
        'BEARDED BARBET',
        'BEARDED BELLBIRD',
        'BEARDED REEDLING',
        'BELTED KINGFISHER',
        'BIRD OF PARADISE',
        'BLACK AND YELLOW BROADBILL',
        'BLACK BAZA',
        'BLACK BREASTED PUFFBIRD',
        'BLACK COCKATO',
        'BLACK FACED SPOONBILL',
        'BLACK FRANCOLIN',
        'BLACK HEADED CAIQUE',
        'BLACK NECKED STILT',
        'BLACK SKIMMER',
        'BLACK SWAN',
        'BLACK TAIL CRAKE',
        'BLACK THROATED BUSHTIT',
        'BLACK THROATED HUET',
        'BLACK THROATED WARBLER',
        'BLACK VENTED SHEARWATER',
        'BLACK VULTURE',
        'BLACK-CAPPED CHICKADEE',
        'BLACK-NECKED GREBE',
        'BLACK-THROATED SPARROW',
        'BLACKBURNIAM WARBLER',
        'BLONDE CRESTED WOODPECKER',
        'BLOOD PHEASANT',
        'BLUE COAU',
        'BLUE DACNIS',
        'BLUE GRAY GNATCATCHER',
        'BLUE GROSBEAK',
        'BLUE GROUSE',
        'BLUE HERON',
        'BLUE MALKOHA',
        'BLUE THROATED PIPING GUAN',
        'BLUE THROATED TOUCANET',
        'BOBOLINK',
        'BORNEAN BRISTLEHEAD',
        'BORNEAN LEAFBIRD',
        'BORNEAN PHEASANT',
        'BRANDT CORMARANT',
        'BREWERS BLACKBIRD',
        'BROWN CREPPER',
        'BROWN HEADED COWBIRD',
        'BROWN NOODY',
        'BROWN THRASHER',
        'BUFFLEHEAD',
        'BULWERS PHEASANT',
        'BURCHELLS COURSER',
        'BUSH TURKEY',
        'CAATINGA CACHOLOTE',
        'CABOTS TRAGOPAN',
        'CACTUS WREN',
        'CALIFORNIA CONDOR',
        'CALIFORNIA GULL',
        'CALIFORNIA QUAIL',
        'CAMPO FLICKER',
        'CANARY',
        'CANVASBACK',
        'CAPE GLOSSY STARLING',
        'CAPE LONGCLAW',
        'CAPE MAY WARBLER',
        'CAPE ROCK THRUSH',
        'CAPPED HERON',
        'CAPUCHINBIRD',
        'CARMINE BEE-EATER',
        'CASPIAN TERN',
        'CASSOWARY',
        'CEDAR WAXWING',
        'CERULEAN WARBLER',
        'CHARA DE COLLAR',
        'CHATTERING LORY',
        'CHESTNET BELLIED EUPHONIA',
        'CHESTNUT WINGED CUCKOO',
        'CHINESE BAMBOO PARTRIDGE',
        'CHINESE POND HERON',
        'CHIPPING SPARROW',
        'CHUCAO TAPACULO',
        'CHUKAR PARTRIDGE',
        'CINNAMON ATTILA',
        'CINNAMON FLYCATCHER',
        'CINNAMON TEAL',
        'CLARKS GREBE',
        'CLARKS NUTCRACKER',
        'COCK OF THE  ROCK',
        'COCKATOO',
        'COLLARED ARACARI',
        'COLLARED CRESCENTCHEST',
        'COMMON FIRECREST',
        'COMMON GRACKLE',
        'COMMON HOUSE MARTIN',
        'COMMON IORA',
        'COMMON LOON',
        'COMMON POORWILL',
        'COMMON STARLING',
        'COPPERSMITH BARBET',
        'COPPERY TAILED COUCAL',
        'CRAB PLOVER',
        'CRANE HAWK',
        'CREAM COLORED WOODPECKER',
        'CRESTED AUKLET',
        'CRESTED CARACARA',
        'CRESTED COUA',
        'CRESTED FIREBACK',
        'CRESTED KINGFISHER',
        'CRESTED NUTHATCH',
        'CRESTED OROPENDOLA',
        'CRESTED SERPENT EAGLE',
        'CRESTED SHRIKETIT',
        'CRESTED WOOD PARTRIDGE',
        'CRIMSON CHAT',
        'CRIMSON SUNBIRD',
        'CROW',
        'CUBAN TODY',
        'CUBAN TROGON',
        'CURL CRESTED ARACURI',
        'D-ARNAUDS BARBET',
        'DALMATIAN PELICAN',
        'DARJEELING WOODPECKER',
        'DARK EYED JUNCO',
        'DAURIAN REDSTART',
        'DEMOISELLE CRANE',
        'DOUBLE BARRED FINCH',
        'DOUBLE BRESTED CORMARANT',
        'DOUBLE EYED FIG PARROT',
        'DOWNY WOODPECKER',
        'DUNLIN',
        'DUSKY LORY',
        'DUSKY ROBIN',
        'EARED PITA',
        'EASTERN BLUEBIRD',
        'EASTERN BLUEBONNET',
        'EASTERN GOLDEN WEAVER',
        'EASTERN MEADOWLARK',
        'EASTERN ROSELLA',
        'EASTERN TOWEE',
        'EASTERN WIP POOR WILL',
        'EASTERN YELLOW ROBIN',
        'ECUADORIAN HILLSTAR',
        'EGYPTIAN GOOSE',
        'ELEGANT TROGON',
        'ELLIOTS  PHEASANT',
        'EMERALD TANAGER',
        'EMPEROR PENGUIN',
        'EMU',
        'ENGGANO MYNA',
        'EURASIAN BULLFINCH',
        'EURASIAN GOLDEN ORIOLE',
        'EURASIAN MAGPIE',
        'EUROPEAN GOLDFINCH',
        'EUROPEAN TURTLE DOVE',
        'EVENING GROSBEAK',
        'FAIRY BLUEBIRD',
        'FAIRY PENGUIN',
        'FAIRY TERN',
        'FAN TAILED WIDOW',
        'FASCIATED WREN',
        'FIERY MINIVET',
        'FIORDLAND PENGUIN',
        'FIRE TAILLED MYZORNIS',
        'FLAME BOWERBIRD',
        'FLAME TANAGER',
        'FOREST WAGTAIL',
        'FRIGATE',
        'FRILL BACK PIGEON',
        'GAMBELS QUAIL',
        'GANG GANG COCKATOO',
        'GILA WOODPECKER',
        'GILDED FLICKER',
        'GLOSSY IBIS',
        'GO AWAY BIRD',
        'GOLD WING WARBLER',
        'GOLDEN BOWER BIRD',
        'GOLDEN CHEEKED WARBLER',
        'GOLDEN CHLOROPHONIA',
        'GOLDEN EAGLE',
        'GOLDEN PARAKEET',
        'GOLDEN PHEASANT',
        'GOLDEN PIPIT',
        'GOULDIAN FINCH',
        'GRANDALA',
        'GRAY CATBIRD',
        'GRAY KINGBIRD',
        'GRAY PARTRIDGE',
        'GREAT ARGUS',
        'GREAT GRAY OWL',
        'GREAT JACAMAR',
        'GREAT KISKADEE',
        'GREAT POTOO',
        'GREAT TINAMOU',
        'GREAT XENOPS',
        'GREATER PEWEE',
        'GREATER PRAIRIE CHICKEN',
        'GREATOR SAGE GROUSE',
        'GREEN BROADBILL',
        'GREEN JAY',
        'GREEN MAGPIE',
        'GREEN WINGED DOVE',
        'GREY CUCKOOSHRIKE',
        'GREY HEADED CHACHALACA',
        'GREY HEADED FISH EAGLE',
        'GREY PLOVER',
        'GROVED BILLED ANI',
        'GUINEA TURACO',
        'GUINEAFOWL',
        'GURNEYS PITTA',
        'GYRFALCON',
        'HAMERKOP',
        'HARLEQUIN DUCK',
        'HARLEQUIN QUAIL',
        'HARPY EAGLE',
        'HAWAIIAN GOOSE',
        'HAWFINCH',
        'HELMET VANGA',
        'HEPATIC TANAGER',
        'HIMALAYAN BLUETAIL',
        'HIMALAYAN MONAL',
        'HOATZIN',
        'HOODED MERGANSER',
        'HOOPOES',
        'HORNED GUAN',
        'HORNED LARK',
        'HORNED SUNGEM',
        'HOUSE FINCH',
        'HOUSE SPARROW',
        'HYACINTH MACAW',
        'IBERIAN MAGPIE',
        'IBISBILL',
        'IMPERIAL SHAQ',
        'INCA TERN',
        'INDIAN BUSTARD',
        'INDIAN PITTA',
        'INDIAN ROLLER',
        'INDIAN VULTURE',
        'INDIGO BUNTING',
        'INDIGO FLYCATCHER',
        'INLAND DOTTEREL',
        'IVORY BILLED ARACARI',
        'IVORY GULL',
        'IWI',
        'JABIRU',
        'JACK SNIPE',
        'JACOBIN PIGEON',
        'JANDAYA PARAKEET',
        'JAPANESE ROBIN',
        'JAVA SPARROW',
        'JOCOTOCO ANTPITTA',
        'KAGU',
        'KAKAPO',
        'KILLDEAR',
        'KING EIDER',
        'KING VULTURE',
        'KIWI',
        'KNOB BILLED DUCK',
        'KOOKABURRA',
        'LARK BUNTING',
        'LAUGHING GULL',
        'LAZULI BUNTING',
        'LESSER ADJUTANT',
        'LILAC ROLLER',
        'LIMPKIN',
        'LITTLE AUK',
        'LOGGERHEAD SHRIKE',
        'LONG-EARED OWL',
        'LOONEY BIRDS',
        'LUCIFER HUMMINGBIRD',
        'MAGPIE GOOSE',
        'MALABAR HORNBILL',
        'MALACHITE KINGFISHER',
        'MALAGASY WHITE EYE',
        'MALEO',
        'MALLARD DUCK',
        'MANDRIN DUCK',
        'MANGROVE CUCKOO',
        'MARABOU STORK',
        'MASKED BOBWHITE',
        'MASKED BOOBY',
        'MASKED LAPWING',
        'MCKAYS BUNTING',
        'MERLIN',
        'MIKADO  PHEASANT',
        'MILITARY MACAW',
        'MOURNING DOVE',
        'MYNA',
        'NICOBAR PIGEON',
        'NOISY FRIARBIRD',
        'NORTHERN BEARDLESS TYRANNULET',
        'NORTHERN CARDINAL',
        'NORTHERN FLICKER',
        'NORTHERN FULMAR',
        'NORTHERN GANNET',
        'NORTHERN GOSHAWK',
        'NORTHERN JACANA',
        'NORTHERN MOCKINGBIRD',
        'NORTHERN PARULA',
        'NORTHERN RED BISHOP',
        'NORTHERN SHOVELER',
        'OCELLATED TURKEY',
        'OILBIRD',
        'OKINAWA RAIL',
        'ORANGE BREASTED TROGON',
        'ORANGE BRESTED BUNTING',
        'ORIENTAL BAY OWL',
        'ORNATE HAWK EAGLE',
        'OSPREY',
        'OSTRICH',
        'OVENBIRD',
        'OYSTER CATCHER',
        'PAINTED BUNTING',
        'PALILA',
        'PALM NUT VULTURE',
        'PARADISE TANAGER',
        'PARAKETT  AUKLET',
        'PARUS MAJOR',
        'PATAGONIAN SIERRA FINCH',
        'PEACOCK',
        'PEREGRINE FALCON',
        'PHAINOPEPLA',
        'PHILIPPINE EAGLE',
        'PINK ROBIN',
        'PLUSH CRESTED JAY',
        'POMARINE JAEGER',
        'PUFFIN',
        'PUNA TEAL',
        'PURPLE FINCH',
        'PURPLE GALLINULE',
        'PURPLE MARTIN',
        'PURPLE SWAMPHEN',
        'PYGMY KINGFISHER',
        'PYRRHULOXIA',
        'QUETZAL',
        'RAINBOW LORIKEET',
        'RAZORBILL',
        'RED BEARDED BEE EATER',
        'RED BELLIED PITTA',
        'RED BILLED TROPICBIRD',
        'RED BROWED FINCH',
        'RED CROSSBILL',
        'RED FACED CORMORANT',
        'RED FACED WARBLER',
        'RED FODY',
        'RED HEADED DUCK',
        'RED HEADED WOODPECKER',
        'RED KNOT',
        'RED LEGGED HONEYCREEPER',
        'RED NAPED TROGON',
        'RED SHOULDERED HAWK',
        'RED TAILED HAWK',
        'RED TAILED THRUSH',
        'RED WINGED BLACKBIRD',
        'RED WISKERED BULBUL',
        'REGENT BOWERBIRD',
        'RING-NECKED PHEASANT',
        'ROADRUNNER',
        'ROCK DOVE',
        'ROSE BREASTED COCKATOO',
        'ROSE BREASTED GROSBEAK',
        'ROSEATE SPOONBILL',
        'ROSY FACED LOVEBIRD',
        'ROUGH LEG BUZZARD',
        'ROYAL FLYCATCHER',
        'RUBY CROWNED KINGLET',
        'RUBY THROATED HUMMINGBIRD',
        'RUDDY SHELDUCK',
        'RUDY KINGFISHER',
        'RUFOUS KINGFISHER',
        'RUFOUS TREPE',
        'RUFUOS MOTMOT',
        'SAMATRAN THRUSH',
        'SAND MARTIN',
        'SANDHILL CRANE',
        'SATYR TRAGOPAN',
        'SAYS PHOEBE',
        'SCARLET CROWNED FRUIT DOVE',
        'SCARLET FACED LIOCICHLA',
        'SCARLET IBIS',
        'SCARLET MACAW',
        'SCARLET TANAGER',
        'SHOEBILL',
        'SHORT BILLED DOWITCHER',
        'SMITHS LONGSPUR',
        'SNOW GOOSE',
        'SNOW PARTRIDGE',
        'SNOWY EGRET',
        'SNOWY OWL',
        'SNOWY PLOVER',
        'SNOWY SHEATHBILL',
        'SORA',
        'SPANGLED COTINGA',
        'SPLENDID WREN',
        'SPOON BILED SANDPIPER',
        'SPOTTED CATBIRD',
        'SPOTTED WHISTLING DUCK',
        'SQUACCO HERON',
        'SRI LANKA BLUE MAGPIE',
        'STEAMER DUCK',
        'STORK BILLED KINGFISHER',
        'STRIATED CARACARA',
        'STRIPED OWL',
        'STRIPPED MANAKIN',
        'STRIPPED SWALLOW',
        'SUNBITTERN',
        'SUPERB STARLING',
        'SURF SCOTER',
        'SWINHOES PHEASANT',
        'TAILORBIRD',
        'TAIWAN MAGPIE',
        'TAKAHE',
        'TASMANIAN HEN',
        'TAWNY FROGMOUTH',
        'TEAL DUCK',
        'TIT MOUSE',
        'TOUCHAN',
        'TOWNSENDS WARBLER',
        'TREE SWALLOW',
        'TRICOLORED BLACKBIRD',
        'TROPICAL KINGBIRD',
        'TRUMPTER SWAN',
        'TURKEY VULTURE',
        'TURQUOISE MOTMOT',
        'UMBRELLA BIRD',
        'VARIED THRUSH',
        'VEERY',
        'VENEZUELIAN TROUPIAL',
        'VERDIN',
        'VERMILION FLYCATHER',
        'VICTORIA CROWNED PIGEON',
        'VIOLET BACKED STARLING',
        'VIOLET CUCKOO',
        'VIOLET GREEN SWALLOW',
        'VIOLET TURACO',
        'VISAYAN HORNBILL',
        'VULTURINE GUINEAFOWL',
        'WALL CREAPER',
        'WATTLED CURASSOW',
        'WATTLED LAPWING',
        'WHIMBREL',
        'WHITE BREASTED WATERHEN',
        'WHITE BROWED CRAKE',
        'WHITE CHEEKED TURACO',
        'WHITE CRESTED HORNBILL',
        'WHITE EARED HUMMINGBIRD',
        'WHITE NECKED RAVEN',
        'WHITE TAILED TROPIC',
        'WHITE THROATED BEE EATER',
        'WILD TURKEY',
        'WILLOW PTARMIGAN',
        'WILSONS BIRD OF PARADISE',
        'WOOD DUCK',
        'WOOD THRUSH',
        'WOODLAND KINGFISHER',
        'WRENTIT',
        'YELLOW BELLIED FLOWERPECKER',
        'YELLOW BREASTED CHAT',
        'YELLOW CACIQUE',
        'YELLOW HEADED BLACKBIRD',
        'ZEBRA DOVE'];
        console.log("Prediccion", clases[mayorIndice]);
        document.getElementById("resultado").innerHTML = clases[mayorIndice];
        document.getElementById("prob").innerHTML = probabilidadFormateada;
    }

    setTimeout(predecir, 150);
}

function procesarCamara() {
    
    var ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, size, size, 0, 0, size, size);

    setTimeout(procesarCamara, 20);
}

/**
 * Hermite resize - fast image resize/resample using Hermite filter. 1 cpu version!
 * 
 * @param {HtmlElement} canvas
 * @param {int} width
 * @param {int} height
 * @param {boolean} resize_canvas if true, canvas will be resized. Optional.
 * Cambiado por RT, resize canvas...
 */
function resample_single(canvas, width, height, resize_canvas) {
    var width_source = canvas.width;
    var height_source = canvas.height;
    width = Math.round(width);
    height = Math.round(height);

    var ratio_w = width_source / width;
    var ratio_h = height_source / height;
    var ratio_w_half = Math.ceil(ratio_w / 2);
    var ratio_h_half = Math.ceil(ratio_h / 2);

    var ctx = canvas.getContext("2d");
    var ctx2 = resize_canvas.getContext("2d");
    var img = ctx.getImageData(0, 0, width_source, height_source);
    var img2 = ctx2.createImageData(width, height);
    var data = img.data;
    var data2 = img2.data;

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            var x2 = (i + j * width) * 4;
            var weight = 0;
            var weights = 0;
            var weights_alpha = 0;
            var gx_r = 0;
            var gx_g = 0;
            var gx_b = 0;
            var gx_a = 0;
            var center_y = (j + 0.5) * ratio_h;
            var yy_start = Math.floor(j * ratio_h);
            var yy_stop = Math.ceil((j + 1) * ratio_h);
            for (var yy = yy_start; yy < yy_stop; yy++) {
                var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                var center_x = (i + 0.5) * ratio_w;
                var w0 = dy * dy; //pre-calc part of w
                var xx_start = Math.floor(i * ratio_w);
                var xx_stop = Math.ceil((i + 1) * ratio_w);
                for (var xx = xx_start; xx < xx_stop; xx++) {
                    var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                    var w = Math.sqrt(w0 + dx * dx);
                    if (w >= 1) {
                        //pixel too far
                        continue;
                    }
                    //hermite filter
                    weight = 2 * w * w * w - 3 * w * w + 1;
                    var pos_x = 4 * (xx + yy * width_source);
                    //alpha
                    gx_a += weight * data[pos_x + 3];
                    weights_alpha += weight;
                    //colors
                    if (data[pos_x + 3] < 255)
                        weight = weight * data[pos_x + 3] / 250;
                    gx_r += weight * data[pos_x];
                    gx_g += weight * data[pos_x + 1];
                    gx_b += weight * data[pos_x + 2];
                    weights += weight;
                }
            }
            data2[x2] = gx_r / weights;
            data2[x2 + 1] = gx_g / weights;
            data2[x2 + 2] = gx_b / weights;
            data2[x2 + 3] = gx_a / weights_alpha;
        }
    }


    ctx2.putImageData(img2, 0, 0);
}