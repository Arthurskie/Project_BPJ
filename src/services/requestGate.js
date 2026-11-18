export function createRequestGate(){
 let generation=0;
 return {next:()=>++generation,invalidate:()=>{++generation;},isCurrent:request=>request===generation};
}
