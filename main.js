const roads = [
"Alice's House-Bob's House", "Alice's House-Cabin",
"Alice's House-Post Office", "Bob's House-Town Hall",
"Daria's House-Ernie's House", "Daria's House-Town Hall",
"Ernie's House-Grete's House", "Grete's House-Farm",
"Grete's House-Shop", "Marketplace-Farm",
"Marketplace-Post Office", "Marketplace-Shop",
"Marketplace-Town Hall", "Shop-Town Hall"
];
function buildGraph(edges) {
    let graph = Object.create(null);
    function addEdge(from, to) {
    if (graph[from] == null) {
    graph[from] = [to]; //make an array if not have an entry
    } else {
    graph[from].push(to); //push if entry exists
    }
    }
    //edges is undirected this makes it undirectional
    for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
    }
    return graph;
}
const roadGraph = buildGraph(roads);
class VillageState {
    constructor(place,parcels){
        this.place = place;
        this.parcels =parcels
    }
    /* 
    The move method is where the action happens. It first checks whether there
    is a road going from the current place to the destination, and if not, it returns
    the old state since this is not a valid move.
                    ==============================
    Then it creates a new state with the destination as the robot’s new place. But
    it also needs to create a new set of parcels—parcels that the robot is carrying
    (that are at the robot’s current place) need to be moved along to the new place.
    And parcels that are addressed to the new place need to be delivered—that is,
    they need to be removed from the set of undelivered parcels. The call to map
    takes care of the moving, and the call to filter does the delivering.
                     ==============================
    Parcel objects aren’t changed when they are moved but re-created. The move
    method gives us a new village state but leaves the old one entirely intact.

    */
    move(destination) {
        if(!roadGraph[this.place].includes(destination)) {
            return this;
        } else {
            let parcels = this.parcels.map(p => {
                if(p.place != this.place) return p;
                return {place : destination , address : p.address};
            }).filter(p => p.place != p.address);
            return new VillageState(destination, parcels);
        }
    }
}

let first = new VillageState(
    "Post Office",
    [{place: "Post Office", address: "Alice's House"}]
    );
    let next = first.move("Alice's House");

    console.log(next.place);
    // → Alice's House
    console.log(next.parcels);
    // → []
    console.log(first.place);
    // → Post Office
function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
    console.log(`Done in ${turn} turns`);
    break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
    }
    }
function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
    }
function randomRobot(state) {
    return {direction: randomPick(roadGraph[state.place])};
}

VillageState.random = function(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
      let address = randomPick(Object.keys(roadGraph)); //to generate one of te places you can come from
      let place;
      do {
        place = randomPick(Object.keys(roadGraph)); 
      } while (place == address);
      parcels.push({place, address}); 
    }
    return new VillageState("Post Office", parcels);
  };
var mailRoute = [
"Alice's House", "Cabin", "Alice's House", "Bob's House",
"Town Hall", "Daria's House", "Ernie's House",
"Grete's House", "Shop", "Grete's House", "Farm",
"Marketplace", "Post Office"
];

function routeRobot(state, memory) {
if (memory.length == 0) {
    memory = mailRoute;
}
return {direction: memory[0], memory: memory.slice(1)};
}

function findRoute(graph, from, to) {
let work = [{at: from, route: []}];
for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
    if (place == to) return route.concat(place);
    if (!work.some(w => w.at == place)) {
        work.push({at: place, route: route.concat(place)});
    }
    }
}
}

function goalOrientedRobot({place, parcels}, route) {
    if (route.length == 0) {
      let parcel = parcels[0];
      if (parcel.place != place) {
        route = findRoute(roadGraph, place, parcel.place);
      } else {
        route = findRoute(roadGraph, place, parcel.address);
      }
    }
    return {direction: route[0], memory: route.slice(1)};
  }

  console.log(runRobot(VillageState.random(),goalOrientedRobot,[]));