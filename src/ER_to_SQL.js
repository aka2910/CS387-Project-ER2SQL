import { Table, Foreign_Key } from "./Schema";



function ER_to_SQL(er){
    var table_map = {};
    for(var i = 0; i < er.entities.length; i++){
        e = er.entities[i];
        var table = new Table(e.name);
        table_map[e.name] = table;
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
    for(var i = 0; i < er.relations.length; i++){
        r = er.relations[i];
        if(r.is_weak){
            weak_entity = entity_map[r.e1];
            weak_table = table_map[weak_entity.name];
            ident_entity = entity_map[r.e2];
            ident_table = table_map[ident_entity.name];
            for(var j = 0; j < ident_entity.attributes.length; j++){
                a = ident_entity.attributes[j];
                weak_table.addAttribute(a);
                weak_table.addPrimaryKey(a.name);
                foreign = new Foreign_Key(a.name, ident_table.name);
                weak_table.addForeignKey(foreign);
            }
        }
        else{
            if(r.c1=="many" && r.c2=="many"){
                var table = new Table(r.name);
                table_map[r.name] = table;
                for(var j = 0; j < r.attributes.length; j++){
                    a = r.attributes[j];
                    table.addAttribute(a);
                    if(a.is_key){
                        table.addPrimaryKey(a.name);
                    }
                }
                var e1 = entity_map[r.e1];
                var e2 = entity_map[r.e2];
                for (var j = 0; j < e1.attributes.length; j++) {
                    a = e1.attributes[j];
                    if (a.is_key) {
                        table.addAttribute(a);
                        table.addPrimaryKey(a.name);
                        foreign = new Foreign_Key(a.name, e2.name);
                        table.addForeignKey(foreign);
                    }
                }
                for (var j = 0; j < e2.attributes.length; j++) {
                    a = e2.attributes[j];
                    if (a.is_key) {
                        table.addAttribute(a);
                        table.addPrimaryKey(a.name);
                        foreign = new Foreign_Key(a.name, e1.name);
                        table.addForeignKey(foreign);
                    }
                }
            }
            else if(r.c1=="many" && r.c2=="one"){
                var e1 = entity_map[r.e1];
                var e2 = entity_map[r.e2];
                var t1 = table_map[r.e1];
                var t2 = table_map[r.e2];
                for(var j=0; j<t2.primary_keys.length; j++){
                    var pk = t2.primary_keys[j];
                    t1.addAttribute(pk);
                    foreign = new Foreign_Key(pk, t2.name);
                    t1.addForeignKey(foreign);
                }
            }
            else {
                var e1 = entity_map[r.e1];
                var e2 = entity_map[r.e2];
                var t1 = table_map[r.e1];
                var t2 = table_map[r.e2];
                for(var j=0; j<t1.primary_keys.length; j++){
                    var pk = t1.primary_keys[j];
                    t2.addAttribute(pk);
                    foreign = new Foreign_Key(pk, t1.name);
                    t2.addForeignKey(foreign);
                }
            }
        }
    }
}