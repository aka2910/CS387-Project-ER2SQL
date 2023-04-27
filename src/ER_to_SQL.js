import { Table, Foreign_Key } from "./Schema";

function ER_to_SQL(er){
    for(var i = 0; i < er.entities.length; i++){
        e = er.entities[i];
        var table = new Table(e.name);
        if(!e.is_weak){
            for(var j = 0; j < e.attributes.length; j++){
                a = e.attributes[j];
                table.addAttribute(a);
                if(a.is_key){
                    table.addPrimaryKey(a.name);
                }
            }
        }
        else{
            for(var j = 0; j < e.attributes.length; j++){
                a = e.attributes[j];
                table.addAttribute(a);
                table.addPrimaryKey(a.name);
            }
        }
    }
}