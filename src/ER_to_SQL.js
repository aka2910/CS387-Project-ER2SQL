var {Entity, Attribute, Relation, ER} = require('./ER.js');
var er = require('./json_convert.js');
var {Table, Foreign_Key} = require('./Schema.js');

function ER_to_SQL(er){
    var table_map = {};
    var entity_map = er.entity_map;
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
        // table.print_sql();
        table_map[e.name] = table;
    }
    for(var i = 0; i < er.relations.length; i++){
        r = er.relations[i];
        // console.log(r);
        if(r.is_weak){
            weak_entity = entity_map[r.e2.name];
            weak_table = table_map[weak_entity.name];
            ident_entity = entity_map[r.e1.name];
            ident_table = table_map[ident_entity.name];
            for (var j=0; j<r.attributes.length; j++){
                a = r.attributes[j];
                weak_table.addAttribute(a);
                if(a.is_key){
                    weak_table.addPrimaryKey(a.name);
                }
            }
            keys_list = [];
            for(var j = 0; j < ident_entity.attributes.length; j++){
                a = ident_entity.attributes[j];
                weak_table.addAttribute(a);
                weak_table.addPrimaryKey(a.name);
                keys_list.push(a.name);
                
            }
            foreign = new Foreign_Key(keys_list, ident_table.name);
            weak_table.addForeignKey(foreign);
            table_map[weak_entity.name] = weak_table;
        }
        else{
        // Assuming partial participation for now
            if(r.c1=="many" && r.c2=="many"){
                var table = new Table(r.name);
                for(var j = 0; j < r.attributes.length; j++){
                    a = r.attributes[j];
                    table.addAttribute(a);
                    if(a.is_key){
                        table.addPrimaryKey(a.name);
                    }
                }
                var e1 = entity_map[r.e1.name];
                var e2 = entity_map[r.e2.name];
                keys_list = [];
                for (var j = 0; j < e1.attributes.length; j++) {
                    a = e1.attributes[j];
                    if (a.is_key) {
                        table.addAttribute(a);
                        table.addPrimaryKey(a.name);
                        keys_list.push(a.name);
                    }
                }
                foreign = new Foreign_Key(keys_list, e1.name);
                table.addForeignKey(foreign);
                keys_list = [];
                for (var j = 0; j < e2.attributes.length; j++) {
                    a = e2.attributes[j];
                    if (a.is_key) {
                        table.addAttribute(a);
                        table.addPrimaryKey(a.name);
                        keys_list.push(a.name);
                    }
                }
                foreign = new Foreign_Key(keys_list, e2.name);
                table.addForeignKey(foreign);
                table_map[r.name] = table;
            }
            else if(r.c1=="many" && r.c2=="one"){
                var e1 = entity_map[r.e1.name];
                var e2 = entity_map[r.e2.name];
                var t1 = table_map[r.e1.name];
                var t2 = table_map[r.e2.name];
                keys_list = [];
                for(var j=0;j<t2.attributes.length;j++){
                    var a = t2.attributes[j];
                    if(a.is_key){
                        t1.addAttribute(a);
                        keys_list.push(a.name);
                    }
                }
                foreign = new Foreign_Key(keys_list, t2.name);
                t1.addForeignKey(foreign);
                table_map[r.e1.name] = t1;
            }
            else {
                var e1 = entity_map[r.e1.name];
                var e2 = entity_map[r.e2.name];
                var t1 = table_map[r.e1.name];
                var t2 = table_map[r.e2.name];
                keys_list = [];
                for(var j=0;j<t1.attributes.length;j++){
                    var a = t1.attributes[j];
                    if(a.is_key){
                        t2.addAttribute(a);
                        keys_list.push(a.name);
                    }
                }
                foreign = new Foreign_Key(keys_list, t1.name);
                t2.addForeignKey(foreign);
                table_map[r.e2.name] = t2;
            }
        }
    }
    for(var i = 0; i < er.entities.length; i++){
        e = er.entities[i];
        var table = table_map[e.name];
        table.print_sql();
    }
    for(var i = 0; i < er.relations.length; i++){
        if(table_map[er.relations[i].name]){
            table_map[er.relations[i].name].print_sql();
        }
    }
}

ER_to_SQL(er);