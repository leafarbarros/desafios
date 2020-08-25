const express = require('express');
const bodyParser = require('body-parser');
const { exception } = require('console');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const app = express();
const router = express.Router();
app.use(bodyParser.json())

router.get('/', (req, res, next) => {
  res.status(200).send({
    title: 'Desafios - Algoritmo 1 e 2',
    version: '1.0.0'
  });
});

// RESPOSTA AO DESAFIO - ALGORITMO 1 
//(obs: Não precisa passar parametros, basta fazer o post para essa rota)
//o parâmetro "modulesDependencies" é opcional e pode ser passado no body da requisição, caso queria testar outras entradas
router.post('/algoritmo1', (req, res, next) => {

    // entrada default
    modulesDependencies = [ { module : 0, dependencies : [] },
                            { module : 1, dependencies : [] },
                            { module : 2, dependencies : [1] }, 
                            { module : 3, dependencies : [0] },
                            { module : 4, dependencies : [] },
                            { module : 5, dependencies : [3] },
                            { module : 6, dependencies : [2,4,5] },
                            { module : 7, dependencies : [5,6] }
                          ];

    if (req.body.modulesDependencies){
        // caso queria testar outras entradas
        modulesDependencies = req.body.modulesDependencies
    }
    
    loadedModules = []
    try {
        
        while (modulesDependencies.length > 0 ){ // enquanto existir módulos a serem carregados

            // seleciona quais os próximo módulos que pode ser carregados
            modulesToLoad = modulesDependencies.filter( moduleToLoad => moduleToLoad.dependencies.subtract(loadedModules).length == 0 ).map(m => m.module); 

            // se não é possível mais carregar nenhum módulo, existe um problema, pois nem todos foram carregados ainda.
            if (modulesToLoad.length == 0){
                throw new Error("Existem dependências que impedem o carregamento de todos os módulos.")
            }

            Array.prototype.push.apply(loadedModules, modulesToLoad); // carrega os módulos

            modulesDependencies = modulesDependencies.filter(m => !loadedModules.includes(m.module)) // remove da lista de módulos a serem carregados
        }

        console.log(loadedModules); // imprime os módulos em ordem de carregamento no console
        res.status(200).json(loadedModules); // retorna um json com os módulos em ordem de carregamento no console
    }
    catch(e){
        res.status(500).send(e.message);
    }
});

// RESPOSTA AO DESAFIO - ALGORITMO 2
//(obs: Não precisa passar parâmetros, basta fazer o post para essa rota)
//o parâmetro "originNode" é opcional e pode ser passado no body da requisição, caso prefira testar outros nós de origem. O resultado sempre será o caminho desse nó para todos os outros 7 nós.
router.post('/algoritmo2', (req, res, next) => {

        originNode = 0;
        if (req.body.originNode){ // caso o usuário prefira testar os caminhos de outras origens basta passar no body "originNode" com o número do nó desejado.
            originNode = req.body.originNode;
        }
       
        var graph = [   { node : 0 , adjacents : [ { node : 1 , cost : 2} , { node : 4 , cost: 3 } ]  },
                        { node : 1 , adjacents : [ { node : 0 , cost : 2} , { node : 3 , cost: 8 } , { node : 5 , cost: 9 } , { node : 6 , cost: 6 } ]  },
                        { node : 2 , adjacents : [ { node : 5 , cost : 3} , { node : 6 , cost: 7 } ]  },
                        { node : 3 , adjacents : [ { node : 1 , cost : 8} , { node : 7 , cost: 6 } ]  },
                        { node : 4 , adjacents : [ { node : 0 , cost : 3} , { node : 6 , cost: 5 } , { node : 7 , cost: 9 }]  },
                        { node : 5 , adjacents : [ { node : 1 , cost : 9} , { node : 2 , cost: 3 } , { node : 6 , cost: 4 } , { node : 7 , cost: 5 } ]  },
                        { node : 6 , adjacents : [ { node : 1 , cost : 6} , { node : 2 , cost: 7 } , { node : 4 , cost: 5 } , { node : 5 , cost: 4 } ]  },
                        { node : 7 , adjacents : [ { node : 3 , cost : 6} , { node : 4 , cost: 9 } , { node : 5 , cost: 5 } ]  }
        ];

        // escolhi o algoritmo de Dijkstra -- implementado a partir de https://pt.wikipedia.org/wiki/Algoritmo_de_Dijkstra 
        // poderia ter escolhido qualquer outro, por exemplo "A*".
        dijkstraOutput = dijkstraAlgorithm(originNode, graph);

        // monta a saida no formato solicitado
        output = [];
        for (i = 0 ; i < d.length ; i++){

            if (originNode == i)
                continue;
            else{
                item = { vertex : i , 
                         cost : dijkstraOutput.dist[i] , 
                         path : (originNode + "-" + printPath(originNode, i, dijkstraOutput.lastPaths)  ) };
                output.push(item);
            }

        }

        console.log(output);
        res.status(200).json(output);

});

//Dijkstra's. Implementado a partir de https://pt.wikipedia.org/wiki/Algoritmo_de_Dijkstra
function dijkstraAlgorithm(originNode,graph){

    const maxCost = (Number.MAX_VALUE - 1); // constante para custo máximo de caminho de um nó a outro.
    d = [ maxCost, maxCost, maxCost, maxCost, maxCost, maxCost, maxCost, maxCost]; // é o vetor de distâncias da origem até cada destino
    pi = [ -1, -1, -1, -1, -1, -1, -1, -1]; // identifica o vértice de onde se origina uma conexão até v de maneira a formar um caminho mínimo
    d[originNode] = 0; // distancia inicial para o nó de origem.
    
    Q = [0, 1, 2, 3, 4, 5, 6, 7]; // vertices
    
    while( Q.length > 0){
        
        dInQ = d.map( (dist, index) => !Q.includes(index)  ? maxCost + 1 : dist ); // vector dist in Q. obs: Foi utilizado (maxCost+1) para indicar que aquela distancia ja foi calculada.
        u = indexOfSmallest(dInQ);
        Q = Q.filter(v => v != u);
        adjacents = graph[u].adjacents;
        adjacents.forEach(v => {

            if (d[v.node] > d[u] + v.cost ){ // se existe um caminho mais curto
                d[v.node] = d[u] + v.cost; // atualzia o custo do caminho
                pi[v.node] = u; // atualiza a referência do caminho 
            }

        });
        
    }

    return { dist: d, lastPaths : pi }; // retorna o vetor de menores distancias e os últimos caminhos para cada nó 

}

// função recursiva para montar o caminho do ponto de origem ao destino
function printPath(origin, target, piVector){

    if (piVector[target] == -1){
        return "(sem caminho)";
    }

    if(piVector[target] == origin){
        return target;
    }
    else{
        return ( printPath(origin, piVector[target], piVector) + "-" + target );
    }
    
}

// devolve o index do array que possui o menor elemento
function indexOfSmallest(a) {
    return a.indexOf(Math.min.apply(Math, a));
}

// função implementada para subtrair os elementos de um array de outro array
Array.prototype.subtract = function (array) {
    var hash = Object.create(null);
    array.forEach(function (a) {
        hash[a] = (hash[a] || 0) + 1;
    });
    return this.filter(function (a) {
       return !hash[a] || (hash[a]--, false);
    });
}

app.use('/', router);

module.exports = app;