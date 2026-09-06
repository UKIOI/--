export function coopScaling(players:number,campaign:boolean){
 const extra=Math.max(0,players-1);
 return {hp:1+(campaign?.35:.65)*extra,rate:1+(campaign?.15:.35)*extra};
}
