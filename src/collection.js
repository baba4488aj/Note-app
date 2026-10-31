import {elements,roles} from './catalog.js';

export function collectionPreferences(value={}){
 return {sort:['collected','name','element','role'].includes(value?.sort)?value.sort:'collected',element:Object.hasOwn(elements,value?.element)?value.element:'all',role:Object.hasOwn(roles,value?.role)?value.role:'all'};
}
export function selectPets(pets,preferences){
 const {sort,element,role}=collectionPreferences(preferences),elementOrder=Object.keys(elements),roleOrder=Object.keys(roles);
 const result=pets.filter(p=>(element==='all'||p.element===element)&&(role==='all'||p.role===role));
 const name=(a,b)=>a.name.localeCompare(b.name,'en',{numeric:true,sensitivity:'base'})||a.id.localeCompare(b.id);
 if(sort==='name')result.sort(name);
 if(sort==='element')result.sort((a,b)=>elementOrder.indexOf(a.element)-elementOrder.indexOf(b.element)||roleOrder.indexOf(a.role)-roleOrder.indexOf(b.role)||name(a,b));
 if(sort==='role')result.sort((a,b)=>roleOrder.indexOf(a.role)-roleOrder.indexOf(b.role)||elementOrder.indexOf(a.element)-elementOrder.indexOf(b.element)||name(a,b));
 return result;
}
