export function invitationLinks(server:string,code:string,addresses:string[]):string[]{
 try{
  const base=new URL(server);
  if(!['http:','https:'].includes(base.protocol))return [];
  const local=(host:string)=>host==='localhost'||host.endsWith('.localhost')||host==='[::1]'||host==='0.0.0.0'||host==='[::]'||host.startsWith('127.');
  const hosts=local(base.hostname)?addresses:[base.hostname];
  return [...new Set(hosts)].filter(host=>host&&!local(host)).map(host=>{
   const url=new URL(base.origin);url.hostname=host;url.pathname='/';url.searchParams.set('lan',code);return url.href;
  });
 }catch{return [];}
}
